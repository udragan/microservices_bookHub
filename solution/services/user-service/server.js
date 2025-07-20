import express, { json } from 'express';
import { sync } from './config/database';
import { create, findAll, findByPk } from './models/user';
import { createServer } from 'https';
import { readFileSync } from 'fs';

const app = express();
const port = 8002;

// Load SSL certificate and key
const options = {
	key: readFileSync('cert/localhost-key.pem'),
	cert: readFileSync('cert/localhost-cert.pem')
};

// Middleware to parse JSON
app.use(json());

// Sync DB
sync().then(() => {
	console.log('Database & tables created!');
});

// Create user
app.post('/users', async (req, res) => {
	try {
		const { name, email } = req.body;
		const user = await create({ name, email });
		res.status(201).json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get all users
app.get('/users', async (req, res) => {
	const users = await findAll();
	res.json(users);
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
	const user = await findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });
	res.json(user);
});

// Update user
app.put('/users/:id', async (req, res) => {
	const user = await findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });

	const { name, email } = req.body;
	try {
		await user.update({ name, email });
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete user
app.delete('/users/:id', async (req, res) => {
	const user = await findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });

	await user.destroy();
	res.json({ message: 'User deleted' });
});

// Create HTTPS server
createServer(options, app).listen(port, () => {
	console.log(`✅ HTTPS user server running at https://localhost:${port}`);
});
