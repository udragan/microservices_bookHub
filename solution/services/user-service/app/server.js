import express, { json } from 'express';
import bcrypt from 'bcrypt';
import { exec } from 'child_process';
import util from 'util';

import { db } from './db/models/index.js'
import jwtCheck from './auth/authorization.js';


const app = express();
const port = 8002;
const execPromise = util.promisify(exec);

const User = db.User;

// Load SSL certificate and key
// const options = {
// 	key: readFileSync('cert/localhost-key.pem'),
// 	cert: readFileSync('cert/localhost-cert.pem')
// };

// Middleware to parse JSON
app.use(json());

// endpoints ###########################
// internal verify user
app.post('/internal/verify', async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({
		where: {
			email: email
		}
	});
	if (!user || !bcrypt.compareSync(password, user.password)) {
		return res.status(401).send({ error: 'Invalid credentials' });
	}
	res.json({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	});
});


// Register user
app.post('/register', async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		const hash = await bcrypt.hash(password, 10);
		console.log(hash);
		const user = await User.create({ "name": name, "email": email, "password": hash, "role": role });
		res.status(201).json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all users
app.get('/', jwtCheck,  async (req, res) => {
	console.log("Get all users called");

    console.log(req.user);

	const users = await User.findAll();
	res.json(users);
});

// Get user by ID
app.get('/:id', jwtCheck, async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	res.json(user);
});

// Update user
app.put('/:id', jwtCheck, async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	const { name, password, role } = req.body;
	const hash = await bcrypt.hash(password, 10);
	try {
		await user.update({ "name": name, "password": hash, "role": role });
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete user
app.delete('/:id', jwtCheck, async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	await user.destroy();
	res.json({ message: 'User deleted' });
});
// #####################################

async function runMigrations() {
    try {
        console.log('📦 Running migrations...');
        const { stdout, stderr } = await execPromise(
            'npx sequelize-cli db:migrate --config app/db/config/config.json --migrations-path app/db/migrations'
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
