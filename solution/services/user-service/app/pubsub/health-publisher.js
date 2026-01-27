import { RABBITMQ_HEALTH_EXCHANGE } from '../env.js';
import { getBrokerChannel } from './broker-connection.js';

export function startHealthPublisher(intervalMs = 5000) {
	setInterval(async () => {
		try {
			const channel = getBrokerChannel();

			const healthState = {
				serviceId: "bookhub.user-service",
				body: {
					timestamp: new Date().toISOString(),
					stats: {
						status: "healthy",
						cpu: process.cpuUsage().user,
						memory: process.memoryUsage().rss,
						uptime: process.uptime(),
					},
					data: {
						totalUsers: 4,
					}
				}
			};

			channel.publish(
				RABBITMQ_HEALTH_EXCHANGE,
				"health_status",
				Buffer.from(JSON.stringify(healthState)),
				{ persistent: false }
			);

			console.log("✅ Health state published");
		} catch (err) {
			console.error("❌ Health publish failed", err.message);
		}
	}, intervalMs);
}
