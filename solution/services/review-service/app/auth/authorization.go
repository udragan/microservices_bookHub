package auth

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/golang-jwt/jwt/v4"
)

var jwks *keyfunc.JWKS

func initJWKS() {
	jwksURL := os.Getenv("JWKS_URL")
	log.Printf("INFO:	Using JWKS_URL: %s", jwksURL)
	var err error
	jwks, err = keyfunc.Get(jwksURL, keyfunc.Options{
		RefreshInterval: time.Hour,
		RefreshErrorHandler: func(err error) {
			log.Printf("WARNING:	JWKS refresh error: %v", err)
		},
		RefreshTimeout:    10 * time.Second,
		RefreshUnknownKID: true, // Automatically refresh if key ID not found
	})
	if err != nil {
		log.Printf("WARNING:	Failed to load JWKS from %s: %v", jwksURL, err)
		return
	}
	log.Println("INFO:	JWKS loaded successfully.")
}

func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Printf("WARNING:	Missing authorization header.")
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			log.Printf("WARNING:	Invalid Authorization header format.")
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}
		if jwks == nil {
			initJWKS()
			if jwks == nil {
				log.Printf("WARNING:	JWKS service unavailable.")
				http.Error(w, "JWKS service unavailable.", http.StatusServiceUnavailable)
				return
			}
		}
		token, err := jwt.ParseWithClaims(tokenStr, &JwtUser{}, jwks.Keyfunc)
		if err != nil || !token.Valid {
			log.Printf("WARNING:	Invalid or expired token.")
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}
		// Store claims in context
		claims, isOk := token.Claims.(*JwtUser)
		if !isOk {
			log.Printf("WARNING:	No claims in token.")
			http.Error(w, "No claims in token", http.StatusUnauthorized)
			return
		}
		if claims.Subject == "" {
			log.Printf("WARNING:	Subject claim doesnt exist.")
			http.Error(w, "Subject claim doesnt exist", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), ClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
