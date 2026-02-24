Project Title: "BookHub" – A Microservices-based Book Store

🧩 Overview
"BookHub" is an online book store where users can browse books, purchase them, and leave reviews. It includes:
- User registration (authentication/authorization)
- Book catalog
- Reviews
- Order processing (TODO)
- Payment (mocked) (TODO)
- Notifications (TODO)
- Admin panel

🧱 Microservices Breakdown

| Service Name         | Responsibilities                                | Communication |     |
| -------------------- | ----------------------------------------------- | ------------- | --- |
| Api Gateway          | Request orchestration                           | Rest          |  x  |
| Auth Service         | User registration, login (JWT), role management | Rest + Events |  x  |
| User Service         | Manage user profile data                        | Rest + Events |  x  |
| Book Service         | Manage book data                                | Rest + Events |     |
| Review Service       | Manage book review data                         | Rest + Events |     |
| Stock Service        | Manage book stock                               | Rest + Events |     |
| Order Service        | Manage orders                                   | Rest + Events |     |
| Payment Service      | (mocked) Payment processing                     | Rest + Events |     |
| Notification Service | Email confirmations                             | Events        |     |
| HealthMonitor        | Gather health status of other services          | Rest + Events |     |
| Media Service        | Stores user media files (avatars..)             | Rest + Events |     |

✅ Full Stack Architecture
- Frontend (Angular/Blazor): Interface for users to view books, leave reviews, manage cart, place orders.
- Backend (Node.js, Python, Java, Elixir, C#, Golang): Microservices for domain logic.
- Database: PostgreSQL for core services, MongoDB for reviews (polyglot persistence).
- API Gateway: For routing requests and central auth.

🐳 Containerization
- Docker for each microservice.
- Docker Compose for local orchestration.

🔐 Authentication
- JWT-based auth handled by Auth Service.
- Middleware on other services to validate JWT and roles/permissions.

🧵 Event-Driven Architecture
- RabbitMQ / Kafka for asynchronous communication.
- E.g., When an order is placed, an OrderCreated event is published:
  - Payment Service consumes it and processes payment.
  - Notification Service sends order confirmation.
  - Inventory Service (optional) updates stock.

🔄 Service-to-Service Communication
- REST: Synchronous (e.g., Book → Review).
- Events: Asynchronous (e.g., Order → Payment → Notification).

🛠️ Tech Stack
- Frontend: Angular(mobile) + Blazor(browser)
- API Gateway (Asp.NetCore :8000)
- Auth Service (Asp.NetCore :8001)
- User Service (nodejs :8002)
	- db (postgres :6002) with sequelize 
- Book Service (python :8003)
	- db (postgres :6003) with alembic
- Review Service (golang :8004)
	- db (mongodb :6004)
- HealthMonitor Service (elixir :8010)
	 message format:
> 		{
> 			"serviceId": "\<service-identifier>",
> 			"timestamp": "\<utc ISOString>",
> 			"stats": \[..]
> 			"data": \[..]
> 		}
- Media Service (python :8011)
- RabbitMQ message broker ( :5672)
 	
🧪 Example Flow (for learning)
- User signs up via Auth Service → JWT token issued.
- User browses books → Book Service (GET /books)
- User adds book to cart & places order → Order Service
- Order Service emits OrderCreated event:
  - Payment Service handles payment.
  - Notification Service sends confirmation.
- User reviews the book → Review Service (with Book ID)

🧠 Bonus Ideas to Extend
- Integrate OpenTelemetry for monitoring
- Add Rate limiting or caching (Redis)
