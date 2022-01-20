import { Directions } from "../../consts/directions";
import Intent, { IntentProcessTypes, IntentTypes } from "../intent";

export default class MoveIntent implements Intent{
    playerId: string;
    type: IntentTypes = IntentTypes.Move;
    context: IntentProcessTypes = IntentProcessTypes.Player;
    direction: Directions;

    constructor(playerId: string, direction: Directions){
        this.direction = direction;
        this.playerId = playerId;
    }
    static fromJSObject(jsObject: {playerId: string, direction: Directions}){
        return new this(jsObject.playerId, jsObject.direction)
    }

}