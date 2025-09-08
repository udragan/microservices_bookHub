package auth

import "github.com/golang-jwt/jwt/v4"

type JwtUser struct {
	Name  string `bson:"name"`
	Email string `bson:"email"`
	Role  string `bson:"role"`
	jwt.RegisteredClaims
}
