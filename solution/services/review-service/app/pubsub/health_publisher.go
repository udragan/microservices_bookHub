package pubsub

import (
	"context"
	"log"
	"os"
	"time"
	
	"bookhub/review-service/app/models"

	amqp "github.com/rabbitmq/amqp091-go"
)

func newHealthWorker(url string) *models.HealthWorker {
	return &models.HealthWorker{
		Url:  url,
		Done: make(chan bool),
	}
}

func StartHealthPublisher(ctx context.Context) {
	RABBITMQ_HOST := os.Getenv("RABBITMQ_HOST")
	RABBITMQ_HEARTBEAT_EXCHANGE := os.Getenv("RABBITMQ_HEARTBEAT_EXCHANGE")
	RABBITMQ_CONNECTION_STRING := "amqp://" + RABBITMQ_HOST + ":5672/"
	log.Printf("[INFO] PubSub - RABBITMQ_HOST=%s", RABBITMQ_HOST)
	log.Printf("[INFO] PubSub - RABBITMQ_HEARTBEAT_EXCHANGE=%s", RABBITMQ_HEARTBEAT_EXCHANGE)

	 worker := newHealthWorker(RABBITMQ_CONNECTION_STRING)
	 
	for {
		err := worker.Connect()
		if err != nil {
			log.Printf("Could not connect to RabbitMQ: %v. Retrying in 5s...", err)
			select {
			case <-ctx.Done():
				return
			case <-time.After(5 * time.Second):
				continue
			}
		}

		notifyClose := worker.Connection.NotifyClose(make(chan *amqp.Error))

		if err := worker.RunPublishLoop(ctx, notifyClose); err != nil {
			log.Printf("Loop exited: %v", err)
		}

		select {
		case <-ctx.Done():
			return
		default:
			// Loop continues to attempt reconnection
		}
	}
}
