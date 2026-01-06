import bcrypt from 'bcrypt';
import { db } from './db/models/index.js';
import { toUserDto }  from './mappers/user-mapper.js';

const User = db.User;

export async function verifyCredentials(request, response) {
	const { email, password } = request.body;
	const user = await User.findOne({
		where: {
			email: email
		}
	});
	if (!user || !bcrypt.compareSync(password, user.password)) {
		return response.status(401).send({ error: 'Invalid credentials' });
	}
	response.json({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	});
}

export async function registerUser(request, response) {
	try {
		const { name, email, password, role } = request.body;
		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({ "name": name, "email": email, "password": hash, "role": role });
		response.status(201).json(user);
	} catch (err) {
		response.status(400).json({ error: err.message });
	}
}

export async function getAll(request, response) {
	console.log("Get all users called");
	console.log(request.user);

	const users = await User.findAll();
	const userDtos = users.map(user => toUserDto(user));
	response.json(userDtos);
}

export async function getById(request, response) {
	const user = await User.findByPk(request.params.id);
	if (!user) {
		return response.status(404).json({ message: 'User not found' });
	}
	const userDto = toUserDto(user);
	response.json(userDto);
}

export async function updateUser(request, response) {
	const user = await User.findByPk(request.params.id);
	if (!user) {
		return response.status(404).json({ message: 'User not found' });
	}
	const { name, role } = request.body;
	try {
		await user.update({ "name": name, "role": role });
		const userDto = toUserDto(user);
		response.json(userDto);
	} catch (err) {
		response.status(400).json({ error: err.message });
	}
}

export async function deleteUser(req, res) {
	const user = await User.findByPk(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	await user.destroy();
	res.json({ message: 'User deleted' });
}
