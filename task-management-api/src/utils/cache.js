const { getRedisClient, isRedisAvailable } = require('../config/redis');

const getCache = async (key) => {
    if (!isRedisAvailable()) return null;
    try {
        const client = getRedisClient();
        if (!client) return null;
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        // Silently fail - Redis is optional
        return null;
    }
};

const setCache = async (key, value, expiration = 3600) => {
    if (!isRedisAvailable()) return false;
    try {
        const client = getRedisClient();
        if (!client) return false;
        await client.setEx(key, expiration, JSON.stringify(value));
        return true;
    } catch (error) {
        // Silently fail - Redis is optional
        return false;
    }
};

const deleteCache = async (key) => {
    if (!isRedisAvailable()) return false;
    try {
        const client = getRedisClient();
        if (!client) return false;
        await client.del(key);
        return true;
    } catch (error) {
        // Silently fail - Redis is optional
        return false;
    }
};

const deleteCachePattern = async (pattern) => {
    if (!isRedisAvailable()) return false;
    try {
        const client = getRedisClient();
        if (!client) return false;
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
        return true;
    } catch (error) {
        // Silently fail - Redis is optional
        return false;
    }
};

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
};
