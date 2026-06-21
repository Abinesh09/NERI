package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `gorm:"uniqueIndex" json:"email"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Test struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Title     string     `json:"title"`
	UserID    uint       `json:"user_id"` // User who requested it
	Questions []Question `gorm:"foreignKey:TestID" json:"questions"`
	CreatedAt time.Time  `json:"created_at"`
}

type Question struct {
	ID            uint     `gorm:"primaryKey" json:"id"`
	TestID        uint     `json:"test_id"`
	QuestionText  string   `json:"question"`
	Options       []string `gorm:"serializer:json" json:"options"` // Using json serializer
	CorrectAnswer string   `json:"correct_answer"`
	Explanation   string   `json:"explanation"`
}

type TestAttempt struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	UserID      uint         `json:"user_id"`
	TestID      uint         `json:"test_id"`
	Score       int          `json:"score"`
	Total       int          `json:"total"`
	TimeTaken   int          `json:"time_taken"` // in seconds
	CompletedAt time.Time    `json:"completed_at"`
	Answers     []UserAnswer `gorm:"foreignKey:AttemptID" json:"answers"`
}

type UserAnswer struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	AttemptID  uint   `json:"attempt_id"`
	QuestionID uint   `json:"question_id"`
	UserChoice string `json:"user_choice"`
	IsCorrect  bool   `json:"is_correct"`
}

type ScheduledTest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `json:"user_id"`
	TestID        uint      `json:"test_id"`
	ScheduledTime time.Time `json:"scheduled_time"`
	Status        string    `json:"status"` // PENDING, COMPLETED, MISSED
}

type ChatHistory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Message   string    `json:"message"`
	Role      string    `json:"role"` // "user" or "model"
	CreatedAt time.Time `json:"created_at"`
}
