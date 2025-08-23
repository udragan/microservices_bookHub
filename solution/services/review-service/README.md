- resolve dependencies
> go mod tidy

- create migrations
> migrate create -ext mjs -dir app/db/migrations -seq <migration name>

- migration file format:
    [ //  action  : target
        { "create": "reviews" },
        { "createIndexes": "reviews", "indexes": [
            {
                "key": { "userId": 1 },
                "name": "idx_userId"
            }
            ]
        }
    ]

- apply migrations
> migrate -path ./app/db/migrations -database "mongodb://dev:dev@localhost:6004/reviews" up

- build service
> go build

- run service
> .\app.exe

