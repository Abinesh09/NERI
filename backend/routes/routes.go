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
	tests.Get("/", controllers.ListTests)
	tests.Get("/:id", controllers.GetTest)
	tests.Post("/", controllers.UploadTest)
	tests.Post("/upload", controllers.UploadTest)
	tests.Post("/attempts", controllers.SubmitAttempt)

	api.Get("/profile", controllers.GetProfile)
	api.Get("/history", controllers.GetHistory)
	api.Get("/scheduled-tests", controllers.GetScheduledTests)
	api.Get("/analytics", controllers.GetAnalytics)

	chat := api.Group("/chat")
	chat.Get("/conversations", controllers.ListConversations)
	chat.Post("/conversations", controllers.CreateConversation)
	chat.Delete("/conversations/:id", controllers.DeleteConversation)
	chat.Post("/conversations/:id/messages", controllers.SendChatMessage)
}
