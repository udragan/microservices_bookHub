import Config

rabbitmq_host = System.get_env("RABBITMQ_HOST") || "localhost"
rabbitmq_health_exchange = System.get_env("RABBITMQ_HEALTH_EXCHANGE") || "bookhub.health_exchange"
rabbitmq_health_exchange_queue = System.get_env("RABBITMQ_HEALTH_EXCHANGE_QUEUE") || "bookhub.health_exchange_queue"

config :health_monitor_service, :rabbitmq,
  	host: rabbitmq_host,
  	health_exchange: rabbitmq_health_exchange,
 	health_exchange_queue: rabbitmq_health_exchange_queue
