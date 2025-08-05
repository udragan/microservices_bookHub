import os
import pika
import json

EXCHANGE_NAME="bookhub.book"
RABBITMQ_HOST=os.getenv("RABBITMQ_HOST")
print(f"INFO:   RABBITMQ_HOST={RABBITMQ_HOST}")


def publish_message(routing_key: str, message: dict):
    connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
    channel = connection.channel()

    # Declare topic exchange
    channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type='topic')

    # Publish message
    channel.basic_publish(
        exchange=EXCHANGE_NAME,
        routing_key=routing_key,
        body=json.dumps(message)
    )

    connection.close()
