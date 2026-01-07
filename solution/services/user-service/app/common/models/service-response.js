export class ServiceResponse {
	constructor(data = null, message = '') {
		this.data = data;
		this.message = message;
	}

	static success(data, message = 'Success') {
		return new ServiceResponse(data, message);
	}

	static fail(message = 'An error occurred') {
		return new ServiceResponse(null, message);
	}
}
