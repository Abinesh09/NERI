package controllers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/database"
	"github.com/user/neri/models"
	"github.com/user/neri/utils"
)

// UploadTest handles the upload of question papers and answer keys
func UploadTest(c *fiber.Ctx) error {
	// 1. Get the Question Paper file
	paperFile, err := c.FormFile("question_paper")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Question paper is required",
			"error":   err.Error(),
		})
	}

	// 2. (Optional) Get the Answer Key file
	keyFile, _ := c.FormFile("answer_key")

	// 3. Extract text from the paper (Basic text extraction placeholder for PDF/DOCX)
	// In production, use pdfcpu/UniPDF for PDF and specific DOCX libraries
	paperContent, err := extractTextFromFile(paperFile)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to extract text from question paper",
		})
	}

	keyContent := ""
	if keyFile != nil {
		keyContent, _ = extractTextFromFile(keyFile)
	}

	// 4. Construct prompt for Gemini
	var prompt string
	if keyContent != "" {
		prompt = "Create a JSON test from the following Question Paper. Use the provided Answer Key to accurately set the correct_answer and explanations.\n\nQuestion Paper:\n" + paperContent + "\n\nAnswer Key:\n" + keyContent
	} else {
		prompt = "Create a JSON test from the following Question Paper. Since no answer key is provided, please generate the most accurate answers and explanations using your knowledge.\n\nQuestion Paper:\n" + paperContent
	}

	// 5. Generate Test JSON via Gemini
	geminiResponse, err := utils.GenerateTestJSON(prompt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "AI failed to generate test",
			"error":   err.Error(),
		})
	}

	// 6. Parse JSON and Save to Database
	// Assuming Gemini returns clean JSON, we parse it into our models
	// Note: We might need to clean the string (remove markdown ```json)
	cleanedJSON := cleanMarkdownJSON(geminiResponse)

	var extractedData struct {
		Title     string `json:"title"`
		Questions []struct {
			Question      string   `json:"question"`
			Options       []string `json:"options"`
			CorrectAnswer string   `json:"correct_answer"`
			Explanation   string   `json:"explanation"`
		} `json:"questions"`
	}

	if err := json.Unmarshal([]byte(cleanedJSON), &extractedData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to parse AI response",
			"error":   err.Error(),
			"raw":     cleanedJSON,
		})
	}

	// Create Test in DB (assuming user ID is 1 for now, in prod extract from JWT)
	test := models.Test{
		Title:  extractedData.Title,
		UserID: 1, 
	}
	database.DB.Create(&test)

	// Create Questions in DB
	for _, q := range extractedData.Questions {
		question := models.Question{
			TestID:        test.ID,
			QuestionText:  q.Question,
			Options:       q.Options,
			CorrectAnswer: q.CorrectAnswer,
			Explanation:   q.Explanation,
		}
		database.DB.Create(&question)
	}

	return c.JSON(fiber.Map{
		"message": "Test generated successfully",
		"test_id": test.ID,
		"title":   test.Title,
		"warning": keyContent == "", // If true, warn user that AI generated answers
	})
}

// extractTextFromFile is a placeholder for actual PDF/DOCX/OCR parsing logic
func extractTextFromFile(fileHeader interface{}) (string, error) {
	// For this working implementation, we assume the file is read.
	// In reality, you'd open the multipart.FileHeader and pass it to pdfcpu or OCR
	return "Sample Extracted Text From File...", nil
}

func cleanMarkdownJSON(input string) string {
	// Basic cleanup for ```json ... ``` tags that LLMs sometimes return
	input = bytes.ReplaceAll([]byte(input), []byte("```json\n"), []byte(""))
	input = bytes.ReplaceAll([]byte(input), []byte("\n```"), []byte(""))
	return string(input)
}
