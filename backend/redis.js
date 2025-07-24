const { createClient } = require("redis"); // for Redis Cache
let client;

const getClient = async () => {
  if (!client) {
    client = createClient({
      // creates Redis Cache (for a portion of the news database)
      username: "default",
      password: process.env.CACHE_PASSWORD,
      socket: {
        host: "redis-10864.c16.us-east-1-2.ec2.redns.redis-cloud.com",
        port: process.env.CLOUD_PORT,
      },
    });

    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect();
  }

  return client;
};

module.exports = getClient; // exporting Redis client
