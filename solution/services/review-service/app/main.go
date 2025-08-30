package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"bookhub/review-service/app/auth"
	"bookhub/review-service/app/db"
	"bookhub/review-service/app/pubsub"
	"bookhub/review-service/app/workers"
)

func init() {
	err := godotenv.Load("app/.env")
	if err != nil {
		log.Println("WARNING:	Error loading .env file, using injected env variables!")
	}
}

func main() {
	db.ConnectDB()
	db.RunMigrations()

	go pubsub.StartBookConsumer()
	go workers.StartBookSync()

	router := mux.NewRouter()
	router.Use(auth.JWTAuthMiddleware)

	// endpoints #######################

	router.HandleFunc("/getByBookId/{bookId}", GetByBookId).Methods("GET")

	// #################################

	log.Println("✅ Server listening on port 8004")
	http.ListenAndServe(":8004", router)
}
