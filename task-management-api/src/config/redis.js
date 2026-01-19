const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;
let connectionAttempted = false;

const connectRedis = async () => {
    // Only attempt connection once
    if (connectionAttempted) {
        return redisClient;
    }

    connectionAttempted = true;

    try {
        redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || 6379),
                reconnectStrategy: false, // Don't auto-reconnect
                connectTimeout: 2000,
            },
        });

        // Suppress all error events - Redis is optional
        redisClient.on('error', () => {
            // Silently ignore errors
        });

        redisClient.on('connect', () => {
            isRedisConnected = true;
            console.log('✅ Redis Client Connected');
        });

        // Attempt connection with timeout
        try {
            await Promise.race([
                redisClient.connect(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 2000)
                )
            ]);
            isRedisConnected = true;
            console.log('✅ Redis Client Connected');
            return redisClient;
        } catch (connectError) {
            // Connection failed - close client and mark as unavailable
            try {
                await redisClient.quit();
            } catch (e) {
                // Ignore quit errors
            }
            redisClient = null;
            isRedisConnected = false;
            console.warn('⚠️  Redis not available - caching will be disabled. API will work without Redis.');
            return null;
        }
    } catch (error) {
        // Redis is optional - fail silently
        redisClient = null;
        isRedisConnected = false;
        console.warn('⚠️  Redis not available - caching will be disabled. API will work without Redis.');
        return null;
    }
};

const getRedisClient = () => {
    return isRedisConnected ? redisClient : null;
};

const isRedisAvailable = () => isRedisConnected;

module.exports = { connectRedis, getRedisClient, isRedisAvailable };
