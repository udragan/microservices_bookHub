package pubsub

import (
	"log"
	"os"

	"github.com/rabbitmq/amqp091-go"
)

func StartBookConsumer() {
	RABBITMQ_HOST := os.Getenv("RABBITMQ_HOST")
	RABBITMQ_BOOKS_EXCHANGE := os.Getenv("RABBITMQ_BOOKS_EXCHANGE")
	RABBITMQ_CONNECTION_STRING := "amqp://" + RABBITMQ_HOST + ":5672/"
	log.Printf("INFO:	RABBITMQ_HOST=%s", RABBITMQ_HOST)
	log.Printf("INFO:	RABBITMQ_BOOKS_EXCHANGE=%s", RABBITMQ_BOOKS_EXCHANGE)

	connection, err := amqp091.Dial(RABBITMQ_CONNECTION_STRING)
	if err != nil {
		log.Fatalf("❌ Failed to connect to RabbitMQ: %v", err)
	}
	defer connection.Close()

	channel, err := connection.Channel()
	if err != nil {
		log.Fatalf("❌ Failed to open a channel: %v", err)
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
		log.Fatalf("❌ Failed to declare exchange: %v", err)
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
		log.Fatalf("❌ Failed to declare queue: %v", err)
	}

	// Bind to events
	routingKeys := []string{"book.created", "book.deleted"}
	for _, key := range routingKeys {
		err = channel.QueueBind(queue.Name, key, RABBITMQ_BOOKS_EXCHANGE, false, nil)
		if err != nil {
			log.Fatalf("❌ Failed to bind queue (%s): %v", key, err)
		}
	}

	msgs, err := channel.Consume(queue.Name, "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("❌ Failed to register consumer: %v", err)
	}

	log.Println("📥 Waiting for book events...")

	for msg := range msgs {
		switch msg.RoutingKey {
		case "book.created":
			log.Printf("📘 Book Created: %s", msg.Body)
		case "book.deleted":
			log.Printf("🗑️ Book Deleted: %s", msg.Body)
		default:
			log.Printf("⚠️ Unknown event [%s]: %s", msg.RoutingKey, msg.Body)
		}
	}
}
