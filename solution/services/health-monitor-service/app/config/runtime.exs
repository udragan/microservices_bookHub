import Config

auth_jwks_url = System.get_env("JWKS_URL") || "http://localhost:8001/.well-known/jwks.json"
auth_jwt_audience = System.get_env("JWT_AUDIENCE") || "bookhub-api-gateway"
rabbitmq_host = System.get_env("RABBITMQ_HOST") || "localhost"
rabbitmq_heartbeat_exchange = System.get_env("RABBITMQ_HEARTBEAT_EXCHANGE") || "bookhub.heartbeat_exchange"
rabbitmq_heartbeat_exchange_queue = System.get_env("RABBITMQ_HEARTBEAT_EXCHANGE_QUEUE") || "bookhub.heartbeat_exchange_queue"

config :health_monitor_service, :auth,
	jwks_cache: :jwks_cache,
	jwks_url: auth_jwks_url,
	jwt_audience: auth_jwt_audience

config :health_monitor_service, :rabbitmq,
  	host: rabbitmq_host,
  	heartbeat_exchange: rabbitmq_heartbeat_exchange,
 	heartbeat_exchange_queue: rabbitmq_heartbeat_exchange_queue
