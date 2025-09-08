package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"bookhub/review-service/app/auth"
	"bookhub/review-service/app/common"
	"bookhub/review-service/app/db"
	"bookhub/review-service/app/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func AddReview(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Add Review - started..")
	var DATABASE_NAME = os.Getenv("DATABASE_NAME")
	var item models.Review
	claims, _ := r.Context().Value(auth.ClaimsKey).(*auth.JwtUser)
	err := json.NewDecoder(r.Body).Decode(&item)
	if err != nil {
		log.Printf("[ERR ] ❌ Add Review - Body cannot be decoded, %v", err)
		http.Error(w, "Body cannot be decoded %v", http.StatusInternalServerError)
		return
	}
	item.UserId = claims.Subject
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

func RemoveReview(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Remove Review - started..")
	var DATABASE_NAME = os.Getenv("DATABASE_NAME")
	var dbReview models.Review
	claims, _ := r.Context().Value(auth.ClaimsKey).(*auth.JwtUser)
	vars := mux.Vars(r)
	reviewId := vars["reviewId"]
	objID, err := primitive.ObjectIDFromHex(reviewId)
	if err != nil {
		log.Printf("[ERR ] ❌ Add Review - Invalid ObjectID: %v", err)
		msg := fmt.Sprintf("Invalid objectId: %s", reviewId)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	filter := bson.M{"_id": objID}
	collection := db.Client.Database(DATABASE_NAME).Collection(string(common.ReviewsCollection))
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err = collection.FindOne(ctx, filter).Decode(&dbReview)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("[ERR ] ❌ Remove Review - %v", err)
			msg := fmt.Sprintf("Failed to remove review, %v", err)
			http.Error(w, msg, http.StatusNotFound)
		} else {
			log.Printf("[ERR ] ❌ Remove Review - %v", err)
			msg := fmt.Sprintf("Failed to remove review, %v", err)
			http.Error(w, msg, http.StatusBadRequest)
		}
		return
	}
	if claims.Subject != dbReview.UserId && claims.Role != "admin" {
		log.Printf("[ERR ] ❌ Remove Review - User is not the owner of the review")
		http.Error(w, "Failed to remove review: User is not the owner of the review", http.StatusBadRequest)
		return
	}
	ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err = collection.DeleteOne(ctx, filter)
	if err != nil {
		log.Printf("[ERR ] ❌ Remove Review - %v", err)
		msg := fmt.Sprintf("Failed to remove review, %v", err)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	log.Printf("[INFO] Remove Review - Review with id %s successfully removed.", reviewId)
	w.WriteHeader(http.StatusNoContent)
}

func GetByBookId(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Get By BookId - started..")
	var DATABASE_NAME = os.Getenv("DATABASE_NAME")
	var result []models.Review
	vars := mux.Vars(r)
	bookId := vars["bookId"]
	log.Printf("[INFO] Get By BookId - bookId: %s", bookId)
	filter := bson.M{"bookId": bookId}
	collection := db.Client.Database(DATABASE_NAME).Collection(string(common.ReviewsCollection))
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		log.Printf("[ERR ] ❌ Get By BookId - %v", err)
		msg := fmt.Sprintf("Failed to get reviews by bookId, %v", err)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var review models.Review
		if err = cursor.Decode(&review); err != nil {
			log.Printf("[ERR ] ❌ Get By BookId - error decoding item %v", err)
			msg := fmt.Sprintf("Failed to decode reviews, %v", err)
			http.Error(w, msg, http.StatusBadRequest)
			return
		}
		result = append(result, review)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}
