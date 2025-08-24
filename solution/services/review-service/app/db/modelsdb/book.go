package modelsdb

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Book represents a document in the "books" collection
type Book struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	BookId    int                `bson:"bookId"`
	Timestamp string             `bson:"timestamp"`
}
