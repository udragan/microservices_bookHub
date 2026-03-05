package models

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"
	
	amqp "github.com/rabbitmq/amqp091-go"
)

type HealthWorker struct {
	Url 		string
	Connection  *amqp.Connection
	Channel 	*amqp.Channel
	Done 		chan bool
}

func (worker *HealthWorker) Connect() error {
	var err error
	worker.Connection, err = amqp.Dial(worker.Url)
	if err != nil {
		return err
	}

	worker.Channel, err = worker.Connection.Channel()
	if err != nil {
		return err
	}

	return worker.Channel.ExchangeDeclare(
		os.Getenv("RABBITMQ_HEARTBEAT_EXCHANGE"),	// 1. name (string)
		"fanout",									// 2. type (string)
		false,      	      						// 3. durable (bool)
		false,										// 4. auto-deleted (bool)
		false,										// 5. internal (bool)
		false,										// 6. no-wait (bool)
		nil,             							// 7. args (amqp.Table), "fanout", true, false, false, false, nil,
	)
}

func (h *HealthWorker) RunPublishLoop(ctx context.Context, notifyClose chan *amqp.Error) error {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
			case <-ctx.Done():
				h.Connection.Close()
				return ctx.Err()
			case err := <-notifyClose:
				return err // Break loop to trigger reconnect
			case <-ticker.C:
				payload, _ := json.Marshal(map[string]interface{} {
					"serviceId": "bookhub-review-service",
					"timestamp": time.Now().UTC().Format(time.RFC3339),
				})

				err := h.Channel.PublishWithContext(ctx,
					os.Getenv("RABBITMQ_HEARTBEAT_EXCHANGE"), "", false, false,
					amqp.Publishing{
						ContentType: "application/json",
						Body:        payload,
					})
				
				if err != nil {
					log.Printf("Failed to publish: %v", err)
					return err // Trigger reconnect
				}
		}
	}
}
