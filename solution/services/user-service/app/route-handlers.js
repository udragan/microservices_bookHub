import bcrypt from 'bcrypt';
import { db } from './db/models/index.js';

import { ServiceResponse }  from './common/models/service-response.js';
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
	const userDto = toUserDto(user);
	response.json(userDto);
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
	const userDtos = users.map(user => toUserDto(user))
		.sort((x, y) => x.id - y.id);
	response.json(ServiceResponse.success(userDtos));
}

export async function getMine(request, response) {
	const user = await User.findByPk(request.user.sub);
	if (!user) {
		return response.status(404).json(ServiceResponse.fail('User not found'));
	}
	const userDto = toUserDto(user);
	response.json(ServiceResponse.success(userDto));
}

export async function updateMine(request, response) {
	const user = await User.findByPk(request.user.sub);
	if (!user) {
		return response.status(404).json(ServiceResponse.fail('User not found'));
	}
	const { name, role } = request.body;
	try {
		await user.update({ "name": name, "role": role });
		const userDto = toUserDto(user);
		response.json(ServiceResponse.success(userDto));
	} catch (err) {
		response.status(400).json(ServiceResponse.fail(err.message));
	}
}

export async function updateById(request, response) {
	const { id, name, role } = request.body;
	const user = await User.findByPk(id);
	if (!user) {
		return response.status(404).json(ServiceResponse.fail('User not found'));
	}
	try {
		await user.update({ "name": name, "role": role });
		const userDto = toUserDto(user);
		response.json(ServiceResponse.success(userDto));
	} catch (err) {
		response.status(400).json(ServiceResponse.fail(err.message));
	}
}

export async function passwordChangeMine(request, response) {
	const user = await User.findByPk(request.user.sub);
	if (!user) {
		return response.status(404).json(ServiceResponse.fail('User not found'));
	}
	const { password, newPassword, newPasswordRepeat } = request.body;
	if (newPassword != newPasswordRepeat) {
		return response.status(400).json(ServiceResponse.fail('The new password and confirmation password did not match.'));
	}
	try {
		if (!bcrypt.compareSync(password, user.password)) {
			return response.status(400).send(ServiceResponse.fail('Invalid current password.'));
		}
		const hash = await bcrypt.hash(newPassword, 10);
		await user.update({ "password": hash });
		response.json(ServiceResponse.success(user.id, 'Password changed successfully.'));
	} catch (err) {
		response.status(400).json(ServiceResponse.fail(err.message));
	}
}

export async function passwordReset(request, response) {
	const { id } = request.body;
	const user = await User.findByPk(id);
	if (!user) {
		return response.status(404).json(ServiceResponse.fail('User not found'));
	}
	const hash = await bcrypt.hash("1234", 10);	// TODO_faja: do not use hardcoded default pass but random generate and send to user email!
	try {
		await user.update({ "password": hash });
		// TODO_faja: logout all sessions?
		response.json(ServiceResponse.success(id, 'Your password has been successfully reset. You can now log in with your new credentials.'));
	} catch (err) {
		response.status(400).json(ServiceResponse.fail(err.message));
	}
}

export async function deleteUser(request, response) {
	const user = await User.findByPk(request.params.id);
	if (!user) {
		return response.status(404).json(ServiceResponse.fail('User not found'));
	}
	await user.destroy();
	response.json(ServiceResponse.success(user.id, 'User deleted'));
}
