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

----------------------------------------

naming conventions:
General Principles:
Exported vs. Unexported:
  Identifiers starting with an uppercase letter are exported (publicly accessible), while those starting with a lowercase letter are unexported (private to the package).
MixedCaps:
  Use MixedCaps (camel case) for multi-word names, avoiding underscores.
Acronyms:
  Acronyms should maintain consistent casing (e.g., ServeHTTP, appID, not ServeHttp or appId).

Specific Naming Conventions:
Packages:
  Short, lowercase, and often simple nouns (e.g., time, list, http).
  Avoid underscores or MixedCaps.
  Avoid names that might shadow common local variable names.
Variables:
  Use descriptive names indicating purpose.
  Shorter names are acceptable for local variables with limited scope (e.g., i for index, r for reader).
  Boolean variables often start with Is, Has, Can, or Allow.
Functions:
  Use MixedCaps.
  Exported functions start with an uppercase letter.
  Test functions follow the TestFunctionName convention, taking *testing.T as a parameter, and reside in _test.go files.
Interfaces:
  One-method interfaces are typically named by the method name plus an -er suffix (e.g., Reader for a Read method).
  More complex interfaces might use a noun or a descriptive name.
Constants:
  Use MixedCaps.
  Exported constants start with an uppercase letter.
  Consider using all caps with underscores for truly global, unchanging constants, though this is less common in idiomatic Go.
Struct Fields:
  Use MixedCaps.
  Exported fields start with an uppercase letter.
  Avoid stuttering (e.g., User.ID instead of User.UserID).
Avoid:
  Underscores: in names (except for special cases like _test.go files or generated code).
  Redundant names: given the context (e.g., runeCount inside a RuneCount function).
  Cryptic abbreviations: when a clear, descriptive name is possible.



