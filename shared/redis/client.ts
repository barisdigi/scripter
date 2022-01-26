import { createClient } from 'redis';

export default class RedisWrapper {
    isReady = false;
    #client = createClient();

    constructor(){
        this.#client.on("ready", (err) => {
            this.isReady = false;
        });
        this.#client.connect();
    }
    get(key: string){
        return this.#client.get(key);
    }
    set(key:string, value:string){
        return this.#client.set(key, value);
    }
    hget(key: string, field: string) {
        return this.#client.hGet(key, field);
    }
    hset(key: string, field: string, value: string) {
        return this.#client.hSet(key, field, value);
    }
    hdel(key: string, field: string){
        return this.#client.hDel(key, field);
    }
    hgetall(key: string){
        return this.#client.hGetAll(key);
    }
    push(key: string, value: string | string[]){

        return this.#client.lPush(key, value);
    }
    pop(key: string){
        return this.#client.lPop(key);
    }
    subscribe(topic: string, callback: (message:string, channel:string) => void){
        return this.#client.subscribe(topic, callback)
    }
    publish(channel: string, message: string){
        return this.#client.publish(channel, message);
    }
    length(key: string){
        return this.#client.lLen(key)
    }
    increaseBy(key: string, value: number) {
        return this.#client.incrBy(key, value);
    }

}