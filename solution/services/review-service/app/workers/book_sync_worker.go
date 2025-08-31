package workers

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"bookhub/review-service/app/db"
	"bookhub/review-service/app/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MAX_DELAY = time.Duration(600 * time.Second) // 10 minutes

func StartBookSync() {
	log.Println("Syncing books...")
	attempt := 0

	for {
		time.Sleep(getExponentialBackoffDelay(attempt))
		attempt++
		token, err := getServiceToken()
		if err != nil {
			log.Println("Error getting service token:", err)
			continue
		}
		data, err := getBooksSnapshot(token)
		if err != nil {
			log.Println("Error getting books snapshot:", err)
			continue
		}
		saveCount, err := saveBooksSnapshot(data)
		if err != nil {
			log.Println("Error saving books snapshot to db:", err)
			continue
		}
		log.Printf("Saved %d new books from sync.\n", saveCount)
		break
	}
	log.Println("Book sync Done")
}

func getServiceToken() (models.ServiceTokenResponse, error) {
	SERVICE_TOKEN_URL := os.Getenv("AUTH_SERVICE_URL") + "/internal/token"
	SHARED_SECRET := os.Getenv("SHARED_SECRET")
	var token models.ServiceTokenResponse
	tokenPayload := models.SereviceTokenRequest{
		ServiceName:       "review-service",
		TargetServiceName: "book-service",
		SharedSecret:      SHARED_SECRET}
	jsonTokenPayload, err := json.Marshal(tokenPayload)
	if err != nil {
		return token, err
	}
	response, err := http.Post(SERVICE_TOKEN_URL, "application/json", bytes.NewBuffer(jsonTokenPayload))
	if err != nil {
		return token, err
	}
	defer response.Body.Close()
	tokenResponseBody, err := io.ReadAll(response.Body)
	if err != nil {
		return token, err
	}
	log.Println("Token:", string(tokenResponseBody))
	err = json.Unmarshal([]byte(tokenResponseBody), &token)
	if err != nil {
		return token, err
	}
	return token, nil
}

func getBooksSnapshot(token models.ServiceTokenResponse) ([]models.Book, error) {
	BOOK_SYNC_URL := os.Getenv("BOOK_SERVICE_URL") + "/internal/snapshot"
	var books []models.Book
	request, _ := http.NewRequest("GET", BOOK_SYNC_URL, nil)
	request.Header.Add("Authorization", "Bearer "+token.AccessToken)
	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return books, err
	}
	defer response.Body.Close()
	err = json.NewDecoder(response.Body).Decode(&books)
	return books, err
}

func saveBooksSnapshot(items []models.Book) (int64, error) {
	DATABASE_NAME := os.Getenv("DATABASE_NAME")
	COLLECTION_NAME := "books"
	mongoModels := convertToMongoWriteModel(items)
	collection := db.Client.Database(DATABASE_NAME).Collection(COLLECTION_NAME)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	bulkOptions := options.BulkWrite().SetOrdered(false)
	result, err := collection.BulkWrite(ctx, mongoModels, bulkOptions)
	return result.UpsertedCount, err
}

func convertToMongoWriteModel(items []models.Book) []mongo.WriteModel {
	var mongoModels []mongo.WriteModel
	currentTime := time.Now()
	for _, item := range items {
		filter := bson.M{"bookId": item.ID}
		update := bson.M{"$setOnInsert": bson.M{"bookId": item.ID, "timestamp": currentTime}}
		model := mongo.NewUpdateOneModel().
			SetFilter(filter).
			SetUpdate(update).
			SetUpsert(true)
		mongoModels = append(mongoModels, model)
	}
	return mongoModels
}

func getExponentialBackoffDelay(attempt int) time.Duration {
	delay := time.Duration(math.Pow(2, float64(attempt))) * time.Second
	if delay > MAX_DELAY {
		return MAX_DELAY
	}
	return delay
}
