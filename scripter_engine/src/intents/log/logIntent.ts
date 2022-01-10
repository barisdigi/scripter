import Intent, { IntentProcessTypes, IntentTypes } from "../intent";

export default class LogIntent implements Intent{
    message: string;
    playerId: string;
    type: IntentTypes = IntentTypes.Log;
    context: IntentProcessTypes = IntentProcessTypes.Player;
    time: string;
    constructor(message: string, playerId: string, time: string){
        this.message = message;
        this.playerId = playerId;
        this.time = time;
    }

    get messageWithTime(){
        return `${this.time}: ${this.message}`
    }
}