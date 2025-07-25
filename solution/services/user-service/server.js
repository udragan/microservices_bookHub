import express, { json } from 'express';
import  sequelize  from './db/database.js';
import User from './db/models/user.js';

const app = express();
const port = process.env.PORT || 7002;

// Load SSL certificate and key
// const options = {
// 	key: readFileSync('cert/localhost-key.pem'),
// 	cert: readFileSync('cert/localhost-cert.pem')
// };

// Middleware to parse JSON
app.use(json());

// Sync DB
sequelize.sync().then(() => {
	console.log('Database & tables created!');
});

// Create user
app.post('/', async (req, res) => {
	try {
		const { name, email } = req.body;
		const user = await User.create({ name, email });
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
	if (!user) return res.status(404).json({ message: 'User not found' });
	res.json(user);
});

// Update user
app.put('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id);
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
app.delete('/:id', async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: 'User not found' });

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
