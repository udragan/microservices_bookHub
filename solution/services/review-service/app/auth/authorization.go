package auth

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/golang-jwt/jwt/v4"
)

var jwks *keyfunc.JWKS

func InitJWKS() {
	jwksURL := "http://localhost:8001/.well-known/jwks.json"
	log.Printf("INFO:	Using JWKS_URL: %s", jwksURL)

	var err error
	jwks, err = keyfunc.Get(jwksURL, keyfunc.Options{
		RefreshInterval: time.Hour,
		RefreshErrorHandler: func(err error) {
			log.Printf("JWKS refresh error: %v", err)
		},
		RefreshTimeout:    10 * time.Second,
		RefreshUnknownKID: true, // Automatically refresh if key ID not found
	})

	if err != nil {
		log.Fatalf("Failed to load JWKS from %s: %v", jwksURL, err)
	}

	log.Println("INFO:	JWKS loaded successfully.")
}

func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Optional: set token/claims in context if needed
		next.ServeHTTP(w, r)
	})
}
