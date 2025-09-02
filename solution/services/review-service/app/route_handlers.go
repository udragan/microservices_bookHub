package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"bookhub/review-service/app/auth"
	"bookhub/review-service/app/common"
	"bookhub/review-service/app/db"
	"bookhub/review-service/app/models"

	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddReview(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Add Review - started..")
	var DATABASE_NAME = os.Getenv("DATABASE_NAME")
	var item models.Review
	claims, isOk := r.Context().Value(auth.ClaimsKey).(jwt.MapClaims)
	if !isOk {
		log.Printf("[ERR ] ❌ Add Review - Claims missing in token")
		http.Error(w, "Claims missing", http.StatusUnauthorized)
		return
	}
	claimUserId, isOk := claims["sub"].(string)
	if !isOk {
		log.Printf("[ERR ] ❌ Add Review - Claim 'sub' missing in token")
		http.Error(w, "Claim 'sub' missing", http.StatusUnauthorized)
		return
	}
	userId, err := strconv.Atoi(claimUserId)
	if err != nil {
		log.Printf("[ERR ] ❌ Add Review - Claim 'sub' invalid, %v", err)
		http.Error(w, "Claim 'sub' invalid", http.StatusUnauthorized)
		return
	}
	err = json.NewDecoder(r.Body).Decode(&item)
	if err != nil {
		log.Printf("[ERR ] ❌ Add Review - Body cannot be decoded, %v", err)
		http.Error(w, "Body cannot be decoded %v", http.StatusInternalServerError)
		return
	}
	item.UserId = userId
	item.Timestamp = primitive.NewDateTimeFromTime(time.Now().UTC())
	collection := db.Client.Database(DATABASE_NAME).Collection(string(common.ReviewsCollection))
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	insertResult, err := collection.InsertOne(ctx, item)
	if err != nil {
		log.Printf("[ERR ] ❌ Add Review - Insert failed, %v", err)
		http.Error(w, "Failed to insert new review, %v", http.StatusInternalServerError)
		return
	}
	log.Printf("[INFO] Add Review - review added successfully")
	item.Id = insertResult.InsertedID.(primitive.ObjectID)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func GetByBookId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	bookId := vars["bookId"]

	fmt.Printf("received bookId: %s\n", bookId)
}
