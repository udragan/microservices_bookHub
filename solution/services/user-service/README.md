- run migrations using squelize
   in project root folder
    > npx sequelize-cli db:migrate --config app/db/config/config.json --migrations-path app/db/migrations

- run server
    navigate to root (user-service)
    > node ./app/server.js


----------------------------------------
naming conventions:
General JavaScript Naming Conventions (applicable to Node.js):
- Variables, properties, and function names: Use lowerCamelCase. For example: userName, getUserData, calculateTotal.
- Class and constructor names: Use UpperCamelCase (also known as PascalCase). For example: UserData, UserManager.
- Constants: Use UPPER_CASE with underscores for separation. For example: DATABASE_URL, API_KEY.
- Boolean variables: Prefix with is, has, or should to indicate their true/false nature. For example: isAdmin, hasAccess.
- Arrays: Use plural names to indicate collections. For example: users, products.
- Functions: Use action verbs to describe the operation. For example: fetchData(), saveUserData().

Node.js Specific Naming Conventions:
- File and Folder Names:
    Kebab-case: A common convention for file and directory names, using lowercase letters and hyphens to separate words. For example: user-controller.js, auth-middleware.js, utils/date-helpers.js.
- Short, descriptive names: Aim for clarity and conciseness.
- Environment Variables: Use UPPER_CASE with underscores for separation. For example: process.env.DB_HOST.
- Error Objects: Commonly named err or error in catch blocks.