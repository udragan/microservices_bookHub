package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Review struct {
	Id        primitive.ObjectID `bson:"_id,omitempty"`
	BookId    int                `bson:"bookId"`
	UserId    int                `bson:"userId"`
	Rating    int                `bson:"rating"`
	Text      string             `bson:"text"`
	Timestamp primitive.DateTime `bson:"timestamp"`
}
