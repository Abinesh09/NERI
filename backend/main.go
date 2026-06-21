package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/user/neri/database"
	"github.com/user/neri/routes"
	"github.com/user/neri/utils"
)

func main() {
	// Load environment variables if .env exists
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or error loading it, relying on system env vars")
	}

	// Initialize Gemini
	utils.InitGemini()

	// Connect to database
	database.ConnectDb()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Configure properly in production
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// Setup routes
	routes.Setup(app)

	log.Fatal(app.Listen(":8080"))
}

