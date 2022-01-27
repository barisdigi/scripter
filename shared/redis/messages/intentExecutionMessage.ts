import Intent from "../../../scripter_engine/src/intents/intent";
import { GameTickPhase } from "../../constants/constants";
import { Player } from "../../mongodb/schemas/player";
import { DispatcherMessage } from "./dispatcherMessage";

export class IntentExecutionMessage implements DispatcherMessage {
    executionId: string;
    job: GameTickPhase = GameTickPhase.ResultProcessingPhase;
    processInfo: {
        intents: Intent[]
        player: Player
    };
    constructor(executionId: string, processInfo: { intents: Intent[], player: Player }) {
        this.executionId = executionId;
        this.processInfo = processInfo;
    }
}