import amqp from "amqplib";

import { RABBITMQ_HOST, RABBITMQ_HEALTH_EXCHANGE } from '../env.js';

let channel;
let expBackoff = 1000;

const delay = ms => new Promise(r => setTimeout(r, ms));

export async function connectBroker() {
	while (true) {
		try {
			const connection = await amqp.connect("amqp://" + RABBITMQ_HOST);
			channel = await connection.createChannel();
		
			await channel.assertExchange(RABBITMQ_HEALTH_EXCHANGE, "fanout", { durable: false });
		
			connection.on("close", () => {
				channel =  undefined;
				return setTimeout(connectBroker, 5000);
			});

			process.on("SIGINT", async () => {
				await channel.close();
				await connection.close();
				process.exit(0);
			});

			expBackoff = 1000;
			
			break;
		} catch (error) {
			console.warn('❌ Could not connect to RabbitMQ:', error.message);
			await delay(expBackoff);
			expBackoff *= 2;
		}
	}
}

export function getBrokerChannel() {
	if (!channel) throw new Error("RabbitMQ not connected");
	return channel;
}
