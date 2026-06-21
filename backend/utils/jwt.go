package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID uint) (string, error) {
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Issuer:    fmt.Sprint(userID),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24)), // 1 day expiration
	})

	return claims.SignedString(secretKey())
}

func ParseToken(cookie string) (string, error) {
	token, err := jwt.ParseWithClaims(cookie, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
		return secretKey(), nil
	})

	if err != nil || !token.Valid {
		return "", err
	}

	claims := token.Claims.(*jwt.RegisteredClaims)
	return claims.Issuer, nil
}

func secretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "neri-dev-secret"
	}
	return []byte(secret)
}
