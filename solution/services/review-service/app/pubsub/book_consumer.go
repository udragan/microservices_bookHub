package pubsub

import (
	"log"
	"os"
	"time"

	"bookhub/review-service/app/common"

	"github.com/rabbitmq/amqp091-go"
)

func StartBookConsumer() {
	RABBITMQ_HOST := os.Getenv("RABBITMQ_HOST")
	RABBITMQ_BOOKS_EXCHANGE := os.Getenv("RABBITMQ_BOOKS_EXCHANGE")
	RABBITMQ_CONNECTION_STRING := "amqp://" + RABBITMQ_HOST + ":5672/"
	log.Printf("[INFO] PubSub - RABBITMQ_HOST=%s", RABBITMQ_HOST)
	log.Printf("[INFO] PubSub - RABBITMQ_BOOKS_EXCHANGE=%s", RABBITMQ_BOOKS_EXCHANGE)
	var msgs <-chan (amqp091.Delivery)
	var attempt int

	for {
		time.Sleep(common.GetExponentialBackoffDelay(attempt))
		attempt++
		connection, err := amqp091.Dial(RABBITMQ_CONNECTION_STRING)
		if err != nil {
			log.Printf("[WARN] PubSub - ⚠️ Failed to connect to RabbitMQ: %v\n", err)
			continue
		}
		defer connection.Close()

		channel, err := connection.Channel()
		if err != nil {
			log.Printf("[WARN] PubSub - ⚠️ Failed to open a channel: %v\n", err)
			continue
		}
		defer channel.Close()

		err = channel.ExchangeDeclare(
			RABBITMQ_BOOKS_EXCHANGE, // exchange name
			"topic",                 // topic type
			false,                   // durable
			false,                   // auto-delete
			false,                   // internal
			false,                   // nowait
			nil,                     // args
		)
		if err != nil {
			log.Printf("[WARN] PubSub - ⚠️ Failed to declare exchange: %v\n", err)
			continue
		}

		queue, err := channel.QueueDeclare(
			"bookhub.books_exchange_queue", // queue name
			false,                          // durable
			true,                           // auto-delete
			true,                           // exclusive
			false,                          // nowait
			nil,                            // args
		)
		if err != nil {
			log.Printf("[WARN] PubSub - ⚠️ Failed to declare queue: %v\n", err)
			continue
		}

		// Bind to events
		routingKeys := []string{"book.created", "book.deleted"}
		for _, key := range routingKeys {
			err = channel.QueueBind(queue.Name, key, RABBITMQ_BOOKS_EXCHANGE, false, nil)
			if err != nil {
				log.Printf("[WARN] PubSub - ⚠️ Failed to bind queue (%s): %v\n", key, err)
				continue
			}
		}

		msgs, err = channel.Consume(queue.Name, "", true, false, false, false, nil)
		if err != nil {
			log.Printf("[WARN] PubSub - ⚠️ Failed to register consumer: %v\n", err)
			continue
		}
		break
	}

	log.Println("[INFO] PubSub - 📥 Waiting for book events...")

	for msg := range msgs {
		switch msg.RoutingKey {
		case "book.created":
			log.Printf("[INFO] PubSub - 📘 Book Created: %s", msg.Body)
			HandleBookCreated(msg)
		case "book.deleted":
			log.Printf("[INFO] PubSub - 🗑️ Book Deleted: %s", msg.Body)
			HandleBookDeleted(msg)
		default:
			log.Printf("[INFO] PubSub - ⚠️ Unknown event [%s]: %s", msg.RoutingKey, msg.Body)
		}
	}
}
