package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"bookhub/review-service/app/auth"
	"bookhub/review-service/app/db"
)

func main() {
	err := godotenv.Load("app/.env")
	if err != nil {
		log.Println("WARNING:	Error loading .env file, using injected env variables!")
	}

	db.ConnectDB()
	db.RunMigrations()

	// Start RabbitMQ consumer in a goroutine
	//go startRabbitMQConsumer()

	router := mux.NewRouter()

	router.Use(auth.JWTAuthMiddleware)

	// endpoints #######################

	router.HandleFunc("/getByBookId/{bookId}", GetByBookId).Methods("GET")

	// #################################

	log.Println("✅ Server started on :8004")
	http.ListenAndServe(":8004", router)
}
