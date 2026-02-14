import os
import pika
import json
import time
import threading
from datetime import datetime, timezone

RABBITMQ_HOST=os.getenv("RABBITMQ_HOST")
RABBITMQ_HEARTBEAT_EXCHANGE = os.getenv("RABBITMQ_HEARTBEAT_EXCHANGE")

class HeartbeatPublisher(threading.Thread):
    def __init__(self, interval: int = 10):
        super().__init__(daemon=True)
        self.interval = interval
        self.connection = None
        self.channel = None
        self.service_id = "bookhub.media-service"

    def run(self):
        while True:
            try:
                if not self.connection or self.connection.is_closed:
                    self.connect()

                payload = {
                    "serviceId": self.service_id,
                    "status": "alive",
                    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "stats": {
                        "cpu": 42
                    },
                    "data": {
                        "mediaFiles": 23
                    }
                }
                message_body = json.dumps(payload).encode('utf-8')
                self.channel.basic_publish(
                    exchange = RABBITMQ_HEARTBEAT_EXCHANGE,
                    routing_key = '',
                    body = message_body
                )
                print("[Heartbeat]: Published")
                
                time.sleep(10)

            except (pika.exceptions.AMQPConnectionError, pika.exceptions.AMQPChannelError):
                print("[Heartbeat]: Connection lost. Retrying in 5s...")
                time.sleep(5)
            except Exception as e:
                print(f"[Heartbeat]: Unexpected error: {e}")
                time.sleep(10)

    def connect(self):
        print("[Heartbeat]: Connecting to RabbitMQ..." + RABBITMQ_HOST)        
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
        self.channel = self.connection.channel()
        self.channel.exchange_declare(exchange=RABBITMQ_HEARTBEAT_EXCHANGE, exchange_type='fanout')
