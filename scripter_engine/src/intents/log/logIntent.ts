import RedisWrapper from "../../../../shared/redis/client";
import Intent, { IntentProcessTypes, IntentTypes } from "../intent";

declare global {
    interface Array<T> {
        PublishLogs(client: RedisWrapper): void;
    }
}

if (!Array.prototype.PublishLogs) {
    Array.prototype.PublishLogs = function <T>(this: T[], client: RedisWrapper): void {
        const arraysObject = this.reduce((current: any, value: any) => {
            if (!current[value.playerId]) {
                current[value.playerId] = [value]
            }
            else {
                current[value.playerId].push(value)
            }
            return current;
        }, {})
        Object.keys(arraysObject).forEach(key => {
            const arr = arraysObject[key];
            client.publish(`console_logs/${key}`, JSON.stringify({ logs: arr }))
        });
    }
}

export default class LogIntent implements Intent {
    message: string;
    playerId: string;
    type: IntentTypes = IntentTypes.Log;
    context: IntentProcessTypes = IntentProcessTypes.Player;
    time: string;
    constructor(message: string, playerId: string, time: string) {
        this.message = message;
        this.playerId = playerId;
        this.time = time;
    }

    get messageWithTime() {
        return JSON.stringify({ message: this.message, time: this.time })
    }
}