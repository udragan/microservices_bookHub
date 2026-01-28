import { RABBITMQ_HEARTBEAT_EXCHANGE } from '../env.js';
import { getBrokerChannel } from './broker-connection.js';

export function startHeartbeatPublisher(intervalMs = 5000) {
	setInterval(async () => {
		try {
			const channel = getBrokerChannel();

			const heartbeat = {
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
				RABBITMQ_HEARTBEAT_EXCHANGE,
				"heartbeat_status",
				Buffer.from(JSON.stringify(heartbeat)),
				{ persistent: false }
			);

			console.log("✅ Heartbeat published");
		} catch (err) {
			console.error("❌ Heartbeat publish failed", err.message);
		}
	}, intervalMs);
}
