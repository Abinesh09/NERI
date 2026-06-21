package database

import (
	"fmt"
	"log"
	"os"

	"github.com/user/neri/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDb() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Kolkata",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database. \n", err)
	}

	log.Println("Connected Successfully to Database")
	DB = db

	log.Println("Running Migrations")
	err = db.AutoMigrate(
		&models.User{},
		&models.Test{},
		&models.Question{},
		&models.TestAttempt{},
		&models.UserAnswer{},
		&models.ScheduledTest{},
		&models.ChatConversation{},
		&models.ChatHistory{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database. \n", err)
	}
}
