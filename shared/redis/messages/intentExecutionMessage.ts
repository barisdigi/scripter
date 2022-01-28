import Intent from "../../../scripter_engine/src/intents/intent";
import { GameTickPhase } from "../../constants/constants";
import { Player } from "../../mongodb/schemas/player";
import { DispatcherMessage } from "./dispatcherMessage";

export class IntentExecutionMessage implements DispatcherMessage {
    executionId: string;
    job: GameTickPhase = GameTickPhase.ResultProcessingPhase;
    mapIdToProcess: string;
    constructor(executionId: string, mapIdToProcess: string) {
        this.executionId = executionId;
        this.mapIdToProcess = mapIdToProcess;
    }
}