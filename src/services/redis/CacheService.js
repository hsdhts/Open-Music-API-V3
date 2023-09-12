const redis = require("redis");
const config = require ('../../utils/config')

class CacheService {
  constructor() {
    this._client = redis.createClient({
      host: config.redis.host,  
    });

    this._client.on("error", (error) => {
      console.error(error);
    });
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.setex(key, expirationInSecond, value);
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this._client.get(key, (error, result) => {
        if (error) {
          reject(error);
        } else {
          if (result === null) {
            reject(new Error("Cache tidak ditemukan"));
          } else {
            resolve(result);
          }
        }
      });
    });
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      this._client.del(key, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = CacheService;
