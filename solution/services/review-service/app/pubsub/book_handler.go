package pubsub

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"bookhub/review-service/app/db"
	"bookhub/review-service/app/db/modelsdb"
	"bookhub/review-service/app/models"

	"github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/mongo"
)

var DATABASE_NAME = os.Getenv("DATABASE_NAME")
var COLLECTION_NAME = "books"

func HandleBookCreated(msg amqp091.Delivery) {
	book, err := unmarshal(msg)
	if err != nil {
		log.Printf("Failed to parse message body: %v", err)
		return
	}
	collection := db.Client.Database(DATABASE_NAME).Collection(COLLECTION_NAME)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, book)

	if mongo.IsDuplicateKeyError(err) {
		log.Printf("WARNING:	Book with id: %d already exists!", book.BookId)
		return
	} else if err != nil {
		log.Printf("WARNING:	Save failed for book with id: %d", book.BookId)
		return
	}

	log.Printf("INFO:	Book with id: %d added.", book.BookId)
}

func unmarshal(msg amqp091.Delivery) (modelsdb.Book, error) {
	var bookin models.Book
	var bookdb modelsdb.Book

	err := json.Unmarshal(msg.Body, &bookin)

	if err != nil {
		return bookdb, err
	}

	bookdb = modelsdb.Book{
		BookId:    bookin.ID,
		Timestamp: "43",
	}

	return bookdb, err
}
