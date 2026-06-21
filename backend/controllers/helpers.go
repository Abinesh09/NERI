package controllers

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/utils"
)

func currentUserID(c *fiber.Ctx) (uint, error) {
	token := c.Cookies("jwt")
	if token == "" {
		auth := c.Get("Authorization")
		if strings.HasPrefix(auth, "Bearer ") {
			token = strings.TrimPrefix(auth, "Bearer ")
		}
	}
	if token == "" {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "unauthenticated")
	}

	issuer, err := utils.ParseToken(token)
	if err != nil {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "unauthenticated")
	}

	id, err := strconv.Atoi(issuer)
	if err != nil || id <= 0 {
		return 0, fiber.NewError(fiber.StatusUnauthorized, "invalid user")
	}

	return uint(id), nil
}
