package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"bookhub/review-service/app/auth"
)

func main() {
	// Start RabbitMQ consumer in a goroutine
	//go startRabbitMQConsumer()

	router := mux.NewRouter()

	router.Use(auth.JWTAuthMiddleware)
	auth.InitJWKS()

	// endpoints #######################

	router.HandleFunc("/getByBookId/{bookId}", GetByBookId).Methods("GET")

	// #################################

	log.Println("Server started on :8004")
	http.ListenAndServe(":8004", router)
}
