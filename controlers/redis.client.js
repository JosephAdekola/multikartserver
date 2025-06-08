// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: "redis://localhost:6379",
// });

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// (async () => {
//   await redisClient.connect();
// })();

// module.exports = redisClient;


// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: process.env.REDIS_URL, // Redis Cloud URL with credentials
//   socket: {
//     tls: true, // Enables TLS for secure connection
//   },
// });

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// // Immediately connect
// (async () => {
//   try {
//     await redisClient.connect();
//     console.log("Connected to Redis Cloud");
//   } catch (error) {
//     console.error("Redis connection error:", error);
//   }
// })();

// module.exports = redisClient;


// const { createClient } = require('redis');
// require('dotenv').config()

// const redisClient = createClient({
//     username: process.env.REDIS_USERNAME,
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     }
// });

// redisClient.on('error', err => console.log('Redis Client Error', err));

// async () => {
//     try {
//         await redisClient.connect();

//         await redisClient.set('foo', 'bar');
//         const result = await redisClient.get('foo');
//         console.log(result)  // >>> bar
//     } catch (error) {
//         console.error('redis connection failed', error);
        
//     }
// }


// module.exports = redisClient;

const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  username: process.env.REDIS_USERNAME, // optional for Redis Cloud
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// ✅ Correct: immediately invoke the async function
(async () => {
  try {
    await redisClient.connect();

    await redisClient.set('foo', 'bar');
    const result = await redisClient.get('foo');
    console.log(result); // >>> bar
  } catch (error) {
    console.error('Redis connection failed', error);
  }
})();

module.exports = redisClient;

