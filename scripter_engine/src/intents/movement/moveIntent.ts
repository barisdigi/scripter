import { UnorderedBulkOperation } from "mongodb";
import { DirectionCoordinateManager, Directions } from "../../consts/directions";
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
    addDbOperation(bulk: UnorderedBulkOperation){
        let x: number;
        let y: number;
        ({x, y} = DirectionCoordinateManager.getDirectionVectors(this.direction));
        bulk.find({ playerId: this.playerId }).updateOne({ $inc: { "position.x": x, "position.y": y } })
    }
}