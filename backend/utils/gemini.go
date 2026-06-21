package utils

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

var client *genai.Client

// InitGemini initializes the Gemini client with the API key from environment
func InitGemini() {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("Warning: GEMINI_API_KEY environment variable not set")
		return
	}

	ctx := context.Background()
	var err error
	client, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Failed to create Gemini client: %v", err)
	}
	log.Println("Gemini client initialized successfully")
}

// GenerateTestJSON prompts the model to generate a test in strict JSON format
func GenerateTestJSON(prompt string) (string, error) {
	if client == nil {
		return "", fmt.Errorf("Gemini client not initialized")
	}

	ctx := context.Background()
	model := client.GenerativeModel("gemini-1.5-flash")
	model.ResponseMIMEType = "application/json"

	systemPrompt := `You are an expert test creator. Generate a test based on the user's request.
Return ONLY valid JSON in the following structure without any markdown formatting or backticks:
{
  "title": "Title of the test",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Detailed explanation of why this answer is correct."
    }
  ]
}`

	fullPrompt := fmt.Sprintf("%s\n\nUser Request: %s", systemPrompt, prompt)

	resp, err := model.GenerateContent(ctx, genai.Text(fullPrompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from Gemini")
	}

	part := resp.Candidates[0].Content.Parts[0]
	if text, ok := part.(genai.Text); ok {
		return string(text), nil
	}

	return "", fmt.Errorf("invalid response format from Gemini")
}

func GenerateTestJSONFromFile(prompt string, data []byte, mimeType string) (string, error) {
	if client == nil {
		return "", fmt.Errorf("Gemini client not initialized")
	}

	ctx := context.Background()
	model := client.GenerativeModel("gemini-1.5-flash")
	model.ResponseMIMEType = "application/json"

	systemPrompt := `You are an expert test creator. Extract questions from the uploaded paper and return ONLY valid JSON:
{
  "title": "Title of the test",
  "duration": 45,
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Detailed explanation of why this answer is correct."
    }
  ]
}`

	resp, err := model.GenerateContent(
		ctx,
		genai.Text(systemPrompt+"\n\n"+prompt),
		genai.Blob{MIMEType: mimeType, Data: data},
	)
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from Gemini")
	}

	part := resp.Candidates[0].Content.Parts[0]
	if text, ok := part.(genai.Text); ok {
		return string(text), nil
	}

	return "", fmt.Errorf("invalid response format from Gemini")
}

// GenerateChatResponse sends a message to the model for conversational chat
func GenerateChatResponse(prompt string) (string, error) {
	if client == nil {
		return "", fmt.Errorf("Gemini client not initialized")
	}

	ctx := context.Background()
	model := client.GenerativeModel("gemini-1.5-flash")

	systemInstruction := "You are NERI, a helpful AI assistant for a learning platform. Help the user clear doubts and explain concepts."
	fullPrompt := fmt.Sprintf("%s\n\nUser: %s", systemInstruction, prompt)

	resp, err := model.GenerateContent(ctx, genai.Text(fullPrompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response from Gemini")
	}

	part := resp.Candidates[0].Content.Parts[0]
	if text, ok := part.(genai.Text); ok {
		return string(text), nil
	}

	return "", fmt.Errorf("invalid response format from Gemini")
}
