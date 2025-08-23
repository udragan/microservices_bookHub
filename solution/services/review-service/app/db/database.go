package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mongodb"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// Client is a global variable to hold the MongoDB client
var Client *mongo.Client

func ensureUserExists() {
	DATABASE_URL := os.Getenv("DATABASE_URL")
	DATABASE_USERNAME := os.Getenv("DATABASE_USERNAME")
	DATABASE_PASSWORD := os.Getenv("DATABASE_PASSWORD")
	DATABASE_NAME := os.Getenv("DATABASE_NAME")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. Establish a temporary connection with admin credentials.
	// This connection is only for creating the db user (executed only once).
	adminClient, err := mongo.Connect(ctx, options.Client().ApplyURI(DATABASE_URL))
	if err != nil {
		log.Fatal("Failed to connect with admin user:", err)
	}
	defer adminClient.Disconnect(ctx)

	adminDB := adminClient.Database(DATABASE_NAME)

	// Check if the user already exists
	var result bson.M
	err = adminDB.RunCommand(ctx, bson.D{
		{Key: "usersInfo", Value: bson.D{{Key: "user", Value: DATABASE_USERNAME}, {Key: "db", Value: DATABASE_NAME}}},
	}).Decode(&result)

	if err != nil {
		log.Println("Error checking for user, attempting to create anyway:", err)
	}

	// Check if the user exists based on the command output
	users, ok := result["users"].(bson.A)
	if ok && len(users) > 0 {
		log.Printf("MongoDB user '%s' already exists. Skipping creation.\n", DATABASE_USERNAME)
		return
	}

	log.Printf("MongoDB user '%s' not found. Creating user...\n", DATABASE_USERNAME)

	// Create the user
	createCmd := bson.D{
		{Key: "createUser", Value: DATABASE_USERNAME},
		{Key: "pwd", Value: DATABASE_PASSWORD},
		{Key: "roles", Value: bson.A{
			bson.M{
				"role": "readWrite",
				"db":   DATABASE_NAME,
			},
		}},
	}

	err = adminDB.RunCommand(ctx, createCmd).Err()
	if err != nil {
		log.Fatal("Failed to create MongoDB user:", err)
	}
	log.Printf("MongoDB user '%s' created successfully.\n", DATABASE_USERNAME)
}

func ConnectDB() {
	DATABASE_URL := os.Getenv("DATABASE_URL")
	DATABASE_NAME := os.Getenv("DATABASE_NAME")
	log.Printf("INFO:  Using DATABASE_URL: %s\n", DATABASE_URL)
	log.Printf("INFO:  Using DATABASE_NAME: %s\n", DATABASE_NAME)

	ensureUserExists()

	clientOptions := options.Client().ApplyURI(DATABASE_URL)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	Client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Ping the primary to verify the connection
	err = Client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	Client.Database(DATABASE_NAME)

	log.Println("✅ DB connected!")
}

func RunMigrations() {
	DATABASE_URL := os.Getenv("DATABASE_URL")
	DATABASE_NAME := os.Getenv("DATABASE_NAME")

	log.Println("📦 Running migrations...")

	m, err := migrate.New(
		"file://app/db/migrations",
		DATABASE_URL+DATABASE_NAME)
	if err != nil {
		log.Fatal("❌ Could not create migration instance:", err)
	}

	// Apply all available migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("❌ Failed to apply migrations:", err)
	}

	log.Println("✅ Migrations finished.")
}
