package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/user/neri/controllers"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	auth := api.Group("/auth")
	auth.Post("/register", controllers.Register)
	auth.Post("/login", controllers.Login)
	auth.Post("/logout", controllers.Logout)
	auth.Post("/forgot-password", controllers.ForgotPassword)

	user := api.Group("/user")
	user.Get("/", controllers.User) // Gets current authenticated user

	tests := api.Group("/tests")
	tests.Post("/upload", controllers.UploadTest)
}
