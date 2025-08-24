package modelsdb

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Review represents a document in the "reviews" collection
type Review struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	BookId    int                `bson:"bookId"`
	UserId    int                `bson:"userId"`
	Rating    int                `bson:"rating"`
	Text      string             `bson:"text"`
	Timestamp string             `bson:"timestamp"`
}
