import { Player } from "../../mongodb/schemas/player";
import { GameTickPhase } from "../../constants/constants";
import { DispatcherMessage } from "./dispatcherMessage";

export class ScriptExecutionMessage implements DispatcherMessage{
    player: Player;
    executionId: string;
    job: GameTickPhase = GameTickPhase.ScriptPhase;
    constructor(executionId: string, player: Player){
        this.executionId = executionId;
        this.player = player;
    }
}