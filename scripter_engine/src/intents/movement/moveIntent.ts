import { UnorderedBulkOperation } from "mongodb";
import MongoWrapper from "../../../../shared/mongodb/client";
import { Map } from "../../../../shared/mongodb/schemas/map";
import { Player } from "../../../../shared/mongodb/schemas/player";
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
    validate(map: Map, player: Player): boolean{
        let x: number;
        let y: number;
        ({x, y} = DirectionCoordinateManager.getDirectionVectors(this.direction));
        const newX = player.position.x + x;
        const newY = player.position.y + y
        if(newX < map.size.x && newY < map.size.y && newX >= 0 && newY >= 0){
            return true;
        }
        return false
    }
    addDbOperation(bulk: UnorderedBulkOperation){
        let x: number;
        let y: number;
        ({x, y} = DirectionCoordinateManager.getDirectionVectors(this.direction));
        bulk.find({ playerId: this.playerId }).updateOne({ $inc: { "position.x": x, "position.y": y } })
    }
}