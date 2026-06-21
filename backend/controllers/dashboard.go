package controllers

import (
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/database"
	"github.com/user/neri/models"
)

func GetProfile(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "User not found"})
	}

	var attempts []models.TestAttempt
	database.DB.Where("user_id = ?", userID).Order("completed_at desc").Find(&attempts)

	totalTime := 0
	topScore := (*float64)(nil)
	for _, attempt := range attempts {
		totalTime += attempt.TimeTaken
		if attempt.Total > 0 {
			score := float64(attempt.Score) / float64(attempt.Total) * 100
			if topScore == nil || score > *topScore {
				value := score
				topScore = &value
			}
		}
	}

	return c.JSON(fiber.Map{
		"user":            user,
		"tests_completed": len(attempts),
		"top_score":       topScore,
		"study_time":      totalTime,
	})
}

func GetHistory(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var attempts []models.TestAttempt
	if err := database.DB.Preload("Answers").Where("user_id = ?", userID).Order("completed_at desc").Find(&attempts).Error; err != nil {
		return err
	}
	return c.JSON(attempts)
}

func GetScheduledTests(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var scheduled []models.ScheduledTest
	if err := database.DB.Preload("Test").Where("user_id = ?", userID).Order("scheduled_time asc").Find(&scheduled).Error; err != nil {
		return err
	}
	return c.JSON(scheduled)
}

func GetAnalytics(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var attempts []models.TestAttempt
	if err := database.DB.Where("user_id = ?", userID).Order("completed_at asc").Find(&attempts).Error; err != nil {
		return err
	}
	if len(attempts) == 0 {
		return c.JSON(fiber.Map{"has_data": false})
	}

	totalPercent := 0.0
	highest := 0.0
	totalTime := 0
	trend := make([]fiber.Map, 0, len(attempts))
	subjectTotals := map[string]struct {
		sum   float64
		count int
	}{}

	for _, attempt := range attempts {
		if attempt.Total == 0 {
			continue
		}
		score := float64(attempt.Score) / float64(attempt.Total) * 100
		totalPercent += score
		highest = math.Max(highest, score)
		totalTime += attempt.TimeTaken

		var test models.Test
		label := "Untitled Test"
		if err := database.DB.First(&test, attempt.TestID).Error; err == nil && test.Title != "" {
			label = test.Title
		}

		current := subjectTotals[label]
		current.sum += score
		current.count++
		subjectTotals[label] = current

		trend = append(trend, fiber.Map{
			"date":  attempt.CompletedAt,
			"score": score,
			"test":  label,
		})
	}

	breakdown := make([]fiber.Map, 0, len(subjectTotals))
	for subject, value := range subjectTotals {
		if value.count == 0 {
			continue
		}
		breakdown = append(breakdown, fiber.Map{
			"subject": subject,
			"score":   value.sum / float64(value.count),
		})
	}

	return c.JSON(fiber.Map{
		"has_data":          true,
		"total_tests":       len(attempts),
		"average_score":     totalPercent / float64(len(attempts)),
		"highest_score":     highest,
		"average_time":      totalTime / len(attempts),
		"trend":             trend,
		"subject_breakdown": breakdown,
	})
}
