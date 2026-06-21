package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/database"
	"github.com/user/neri/models"
	"github.com/user/neri/utils"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	if data["name"] == "" || data["email"] == "" || data["password"] == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "name, email and password are required"})
	}

	var existing models.User
	database.DB.Where("email = ?", data["email"]).First(&existing)
	if existing.ID != 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"message": "email already registered"})
	}

	password, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)

	user := models.User{
		Name:     data["name"],
		Email:    data["email"],
		Password: string(password),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "could not create account"})
	}

	return c.JSON(user)
}

func Login(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	var user models.User

	database.DB.Where("email = ?", data["email"]).First(&user)

	if user.ID == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "user not found",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data["password"])); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "incorrect password",
		})
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "could not login",
		})
	}

	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{
		"message": "success",
		"token":   token,
		"user":    user,
	})
}

func User(c *fiber.Ctx) error {
	userID, err := currentUserID(c)
	if err != nil {
		return err
	}

	var user models.User
	database.DB.Where("id = ?", userID).First(&user)

	return c.JSON(user)
}

func Logout(c *fiber.Ctx) error {
	cookie := fiber.Cookie{
		Name:     "jwt",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	return c.JSON(fiber.Map{
		"message": "success",
	})
}

func ForgotPassword(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"message": "If an account exists for that email, password reset instructions will be sent.",
	})
}
