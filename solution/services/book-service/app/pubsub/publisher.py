import os
import pika
import json

RABBITMQ_HOST=os.getenv("RABBITMQ_HOST")
RABBITMQ_BOOKS_EXCHANGE=os.getenv("RABBITMQ_BOOKS_EXCHANGE")
print(f"INFO:   RABBITMQ_HOST={RABBITMQ_HOST}")
print(f"INFO:   RABBITMQ_BOOKS_EXCHANGE={RABBITMQ_BOOKS_EXCHANGE}")


def publish_message(routing_key: str, message: dict):
    connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
    channel = connection.channel()

    # Declare topic exchange
    channel.exchange_declare(exchange=RABBITMQ_BOOKS_EXCHANGE,
        exchange_type='topic')

    # Publish message
    channel.basic_publish(
        exchange=RABBITMQ_BOOKS_EXCHANGE,
        routing_key=routing_key,
        body=json.dumps(message)
    )
    connection.close()
