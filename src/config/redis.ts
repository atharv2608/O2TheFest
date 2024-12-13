import { createClient, RedisClientType } from 'redis';

let client: RedisClientType;

async function initializeRedisClient() {
  if (!client) {
    client = createClient({
      username: process.env.REDIS_USERNAME as string,
      password: process.env.REDIS_PASSWORD as string,
      socket: {
        host: process.env.REDIS_HOST as string,
        port: Number(process.env.REDIS_PORT),
      },
    });

    client.on('error', (err: Error) => console.error('Redis Client Error', err));

    await client.connect();
  }
  return client;
}

export { initializeRedisClient };
