import express, { json } from 'express';
import { exec } from 'child_process';
import util from 'util';

import { db } from './db/models/index.js'
import jwtAuthMiddleware from './auth/authorization.js';
import { verifyCredentials, registerUser, getAll, getById, updateUser, deleteUser } from './route-handlers.js'

const app = express();
const port = 8002;
const execPromise = util.promisify(exec);

// Middleware to parse JSON
app.use(json());

// endpoints ###########################
// internal verify user
app.post('/internal/verify', verifyCredentials);
app.post('/register', registerUser);
app.get('/', jwtAuthMiddleware,  getAll);
app.get('/:id', jwtAuthMiddleware, getById);
app.put('/:id', jwtAuthMiddleware, updateUser);
app.delete('/:id', jwtAuthMiddleware, deleteUser);
// #####################################

async function runMigrations() {
    try {
        console.log('📦 Running migrations...');
        const { stdout, stderr } = await execPromise(
            'npx sequelize-cli db:migrate --config app/db/config/config.json --migrations-path app/db/migrations'
            // uncomment this line to revert the last applied migration!
            //'npx sequelize-cli db:migrate:undo --config app/db/config/config.json --migrations-path app/db/migrations'
        );
        console.log(stdout);
        if (stderr) {
            console.error(stderr);
        }
        console.log('✅ Migrations finished.');
    } catch (err) {
        console.error('❌ Migration error:', err);
        process.exit(1);
    }
}

async function startServer() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ DB connected');

        await runMigrations();

        // Recommendation is to use http inside docker network
        // Use http for now since internal services are not to be exposed outside docker network!
        app.listen(port, '0.0.0.0', async () => {
        console.log(`✅ Server listening on port ${port}`);
        });
    } catch (err) {
        console.error('❌ Server startup failed:', err);
        process.exit(1);
    }
}

startServer();
