package controllers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/database"
	"github.com/user/neri/models"
	"github.com/user/neri/utils"
	"gorm.io/gorm"
)

func ListConversations(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var conversations []models.ChatConversation
	if err := database.DB.Preload("Messages").Where("user_id = ?", userID).Order("updated_at desc").Find(&conversations).Error; err != nil {
		return err
	}
	return c.JSON(conversations)
}

func CreateConversation(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	conversation := models.ChatConversation{
		UserID: userID,
		Title:  "New Chat",
	}
	if err := database.DB.Create(&conversation).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(conversation)
}

func DeleteConversation(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	id := c.Params("id")
	if err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ? AND conversation_id = ?", userID, id).Delete(&models.ChatHistory{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ? AND id = ?", userID, id).Delete(&models.ChatConversation{}).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		return err
	}
	return c.JSON(fiber.Map{"message": "Conversation deleted"})
}

func SendChatMessage(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var payload struct {
		Message string `json:"message"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return err
	}
	message := strings.TrimSpace(payload.Message)
	if message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Message is required"})
	}

	var conversation models.ChatConversation
	if err := database.DB.Where("id = ? AND user_id = ?", c.Params("id"), userID).First(&conversation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"message": "Conversation not found"})
	}

	reply, err := utils.GenerateChatResponse(message)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "AI failed to respond", "error": err.Error()})
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		userMessage := models.ChatHistory{UserID: userID, ConversationID: conversation.ID, Role: "user", Message: message}
		modelMessage := models.ChatHistory{UserID: userID, ConversationID: conversation.ID, Role: "model", Message: reply}
		if err := tx.Create(&userMessage).Error; err != nil {
			return err
		}
		if err := tx.Create(&modelMessage).Error; err != nil {
			return err
		}
		if conversation.Title == "New Chat" {
			title := message
			if len(title) > 60 {
				title = title[:60]
			}
			if err := tx.Model(&conversation).Update("title", title).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to save chat"})
	}

	database.DB.Preload("Messages").First(&conversation, conversation.ID)
	return c.JSON(conversation)
}
