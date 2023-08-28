import { ClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import logger from './helpers/logger.js';
import 'dotenv/config';

const manager = new ClusterManager(`${dirname(fileURLToPath(import.meta.url))}/main.js`, {
    totalShards: 'auto',
    shardsPerClusters: 3,
    mode: 'process',
    token: process.env.DISCORD_TOKEN,
});

manager.on('clusterCreate', (cluster) => {
    logger.info(`Launched Cluster ${cluster.id}`);

    cluster.on('exit', (code, signal) => {
        logger.warn(`Cluster ${cluster.id} exited with code ${code} and signal ${signal}. Restarting...`);
        manager.spawn({});
    });
});

manager.on('error', (error) => {
    logger.error(`Cluster Manager Error:`, error);
});

process.on('SIGINT', () => {
    logger.info('Received SIGINT. Shutting down...');
    process.exit(0);
});

manager.spawn({ timeout: -1 });

manager.extend(new HeartbeatManager({ interval: 2000, maxMissedHeartbeats: 5 }));
