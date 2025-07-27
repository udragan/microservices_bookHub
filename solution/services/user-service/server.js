import express, { json } from 'express';
import { sequelize, User } from './db/models/index.js';
import bcrypt from 'bcrypt';

const app = express();
const port = 8002;

// Load SSL certificate and key
// const options = {
// 	key: readFileSync('cert/localhost-key.pem'),
// 	cert: readFileSync('cert/localhost-cert.pem')
// };

// Middleware to parse JSON
app.use(json());

// Sync DB (not needed when using migrations)
// sequelize.sync().then(() => {
// 	console.log('Database & tables synced!');
// });

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

// Create user
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
app.get('/', async (req, res) => {
	console.log("Get all users called");
	const users = await User.findAll();
	res.json(users);
});

// Get user by ID
app.get('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	res.json(user);
});

// Update user
app.put('/:id', async (req, res) => {
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
app.delete('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	await user.destroy();
	res.json({ message: 'User deleted' });
});

// Create HTTPS server
// createServer(options, app).listen(port, '0.0.0.0', () => {
// 	console.log(`✅ HTTPS user server running at port: ${port}`);
// });

// Recommendation is to use http inside docker network
// Use http for now since internal services are not to be exposed outside docker network!
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
