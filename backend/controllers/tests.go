package controllers

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/database"
	"github.com/user/neri/models"
	"github.com/user/neri/utils"
	"gorm.io/gorm"
)

type extractedQuestion struct {
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectAnswer string   `json:"correct_answer"`
	Explanation   string   `json:"explanation"`
}

type extractedTest struct {
	Title     string              `json:"title"`
	Duration  int                 `json:"duration"`
	Questions []extractedQuestion `json:"questions"`
}

func UploadTest(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	paperFile, err := c.FormFile("question_paper")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Question paper is required"})
	}

	mimeType, err := validateUpload(paperFile)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}

	paperData, err := readMultipartFile(paperFile)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Failed to read question paper"})
	}

	keyContent := ""
	if keyFile, keyErr := c.FormFile("answer_key"); keyErr == nil && keyFile != nil {
		keyMime, keyValidateErr := validateUpload(keyFile)
		if keyValidateErr != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": keyValidateErr.Error()})
		}
		keyData, readErr := readMultipartFile(keyFile)
		if readErr != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Failed to read answer key"})
		}
		keyContent, _ = readableContent(keyFile.Filename, keyMime, keyData)
	}

	readablePaper, readableErr := readableContent(paperFile.Filename, mimeType, paperData)
	prompt := "Create a saved test from the uploaded question paper. Extract every question, options, correct answer, explanation, title, and realistic duration in minutes."
	if readableErr == nil && strings.TrimSpace(readablePaper) != "" {
		prompt += "\n\nQuestion Paper Text:\n" + readablePaper
	}
	if strings.TrimSpace(keyContent) != "" {
		prompt += "\n\nAnswer Key:\n" + keyContent
	} else {
		prompt += "\n\nNo answer key was provided. Infer answers only when enough context exists."
	}

	var geminiResponse string
	if readableErr == nil && strings.TrimSpace(readablePaper) != "" {
		geminiResponse, err = utils.GenerateTestJSON(prompt)
	} else {
		geminiResponse, err = utils.GenerateTestJSONFromFile(prompt, paperData, mimeType)
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "AI failed to generate test", "error": err.Error()})
	}

	var extracted extractedTest
	if err := json.Unmarshal([]byte(cleanMarkdownJSON(geminiResponse)), &extracted); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to parse AI response", "error": err.Error()})
	}
	if strings.TrimSpace(extracted.Title) == "" {
		extracted.Title = strings.TrimSuffix(paperFile.Filename, filepath.Ext(paperFile.Filename))
	}
	if extracted.Duration <= 0 {
		extracted.Duration = len(extracted.Questions)
	}
	if len(extracted.Questions) == 0 {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{"message": "No questions found in uploaded file"})
	}

	var test models.Test
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		test = models.Test{
			Title:    extracted.Title,
			UserID:   userID,
			Duration: extracted.Duration,
			Source:   paperFile.Filename,
		}
		if err := tx.Create(&test).Error; err != nil {
			return err
		}
		for _, q := range extracted.Questions {
			if strings.TrimSpace(q.Question) == "" {
				continue
			}
			question := models.Question{
				TestID:        test.ID,
				QuestionText:  q.Question,
				Options:       q.Options,
				CorrectAnswer: q.CorrectAnswer,
				Explanation:   q.Explanation,
			}
			if err := tx.Create(&question).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to save test", "error": err.Error()})
	}

	var questionCount int64
	database.DB.Model(&models.Question{}).Where("test_id = ?", test.ID).Count(&questionCount)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":        "Test generated successfully",
		"test_id":        test.ID,
		"title":          test.Title,
		"question_count": questionCount,
		"duration":       test.Duration,
		"warning":        strings.TrimSpace(keyContent) == "",
	})
}

func ListTests(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var tests []models.Test
	if err := database.DB.Preload("Questions").Where("user_id = ?", userID).Order("created_at desc").Find(&tests).Error; err != nil {
		return err
	}

	items := make([]fiber.Map, 0, len(tests))
	for _, test := range tests {
		var attempt models.TestAttempt
		lastScore := (*float64)(nil)
		if err := database.DB.Where("user_id = ? AND test_id = ?", userID, test.ID).Order("completed_at desc").First(&attempt).Error; err == nil && attempt.Total > 0 {
			score := float64(attempt.Score) / float64(attempt.Total) * 100
			lastScore = &score
		}
		items = append(items, fiber.Map{
			"id":                 test.ID,
			"title":              test.Title,
			"question_count":     len(test.Questions),
			"duration":           test.Duration,
			"created_at":         test.CreatedAt,
			"last_attempt_score": lastScore,
		})
	}

	return c.JSON(items)
}

func GetTest(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var test models.Test
	if err := database.DB.Preload("Questions").Where("id = ? AND user_id = ?", c.Params("id"), userID).First(&test).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Test not found"})
	}
	return c.JSON(test)
}

func SubmitAttempt(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var payload struct {
		TestID    uint              `json:"test_id"`
		TimeTaken int               `json:"time_taken"`
		Answers   map[string]string `json:"answers"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return err
	}

	var test models.Test
	if err := database.DB.Where("id = ? AND user_id = ?", payload.TestID, userID).First(&test).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Test not found"})
	}

	var questions []models.Question
	if err := database.DB.Where("test_id = ?", payload.TestID).Find(&questions).Error; err != nil {
		return err
	}
	if len(questions) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "No questions found for this test"})
	}

	score := 0
	attempt := models.TestAttempt{
		UserID:      userID,
		TestID:      payload.TestID,
		Total:       len(questions),
		TimeTaken:   payload.TimeTaken,
		CompletedAt: time.Now(),
	}
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&attempt).Error; err != nil {
			return err
		}
		for _, question := range questions {
			userChoice := payload.Answers[fmt.Sprint(question.ID)]
			isCorrect := userChoice != "" && userChoice == question.CorrectAnswer
			if isCorrect {
				score++
			}
			answer := models.UserAnswer{
				AttemptID:  attempt.ID,
				QuestionID: question.ID,
				UserChoice: userChoice,
				IsCorrect:  isCorrect,
			}
			if err := tx.Create(&answer).Error; err != nil {
				return err
			}
		}
		return tx.Model(&attempt).Update("score", score).Error
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to save attempt"})
	}

	return c.JSON(fiber.Map{"message": "Attempt saved", "attempt_id": attempt.ID, "score": score, "total": len(questions)})
}

func readableContent(filename, mimeType string, data []byte) (string, error) {
	if strings.EqualFold(filepath.Ext(filename), ".docx") {
		return extractDocxText(data)
	}
	if strings.HasPrefix(mimeType, "text/") {
		return string(data), nil
	}
	return "", fmt.Errorf("file requires model extraction")
}

func validateUpload(file *multipart.FileHeader) (string, error) {
	ext := strings.ToLower(filepath.Ext(file.Filename))
	switch ext {
	case ".pdf":
		return "application/pdf", nil
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document", nil
	case ".png":
		return "image/png", nil
	case ".jpg", ".jpeg":
		return "image/jpeg", nil
	default:
		return "", fmt.Errorf("unsupported file type")
	}
}

func readMultipartFile(fileHeader *multipart.FileHeader) ([]byte, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()
	return io.ReadAll(file)
}

func extractDocxText(data []byte) (string, error) {
	reader, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return "", err
	}
	for _, file := range reader.File {
		if file.Name != "word/document.xml" {
			continue
		}
		rc, err := file.Open()
		if err != nil {
			return "", err
		}
		defer rc.Close()
		xmlData, err := io.ReadAll(rc)
		if err != nil {
			return "", err
		}
		type textNode struct {
			Text string `xml:",chardata"`
		}
		type document struct {
			Nodes []textNode `xml:"body>p>r>t"`
		}
		var doc document
		if err := xml.Unmarshal(xmlData, &doc); err != nil {
			return "", err
		}
		parts := make([]string, 0, len(doc.Nodes))
		for _, node := range doc.Nodes {
			if strings.TrimSpace(node.Text) != "" {
				parts = append(parts, node.Text)
			}
		}
		return strings.Join(parts, " "), nil
	}
	return "", fmt.Errorf("document text not found")
}

func cleanMarkdownJSON(input string) string {
	input = strings.TrimSpace(input)
	input = strings.TrimPrefix(input, "```json")
	input = strings.TrimPrefix(input, "```")
	input = strings.TrimSuffix(input, "```")
	return strings.TrimSpace(input)
}
