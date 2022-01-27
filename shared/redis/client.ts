import { createClient } from 'redis';
import Logger from '../logger/logger'
const logger = new Logger()
export default class RedisWrapper {
    isReady = false;
    #client = createClient();

    constructor() {
        this.#client.on("ready", (err) => {
            logger.debug(`Redis client is ready`)
            this.isReady = true;
        });
        this.#client.on("error", (err) => {
            logger.error(`Error after redis connection`)
        })
        this.#client.on("reconnecting", () => {
            logger.debug(`Reconnecting to redis client`)
        })
        this.#client.connect().then(() => {
            logger.debug(`Connected to redis`)
        }).catch((err) => {
            logger.error(`Error connecting to redis`)
        })
    }
    get(key: string) {
        return this.#client.get(key);
    }
    set(key: string, value: string) {
        return this.#client.set(key, value);
    }
    hget(key: string, field: string) {
        return this.#client.hGet(key, field);
    }

    hset(key: string, field: string, value: string) {
        return this.#client.hSet(key, field, value);
    }
    hsetnx(key: string, field: string, value: string) {
        return this.#client.hSetNX(key, field, value);
    }
    hdel(key: string, field: string) {
        return this.#client.hDel(key, field);
    }
    hgetall(key: string) {
        return this.#client.hGetAll(key);
    }
    push(key: string, value: string | string[]) {

        return this.#client.lPush(key, value);
    }
    pop(key: string) {
        return this.#client.lPop(key);
    }
    subscribe(topic: string, callback: (message: string, channel: string) => void) {
        return this.#client.subscribe(topic, callback)
    }
    unsubscribe(topic: string) {
        return this.#client.unsubscribe(topic)
    }
    publish(channel: string, message: string) {
        return this.#client.publish(channel, message);
    }
    length(key: string) {
        return this.#client.lLen(key)
    }
    increaseBy(key: string, value: number) {
        return this.#client.incrBy(key, value);
    }

}