import Intent from "../../../scripter_engine/src/intents/intent";
import { GameTickPhase } from "../../constants/constants";
import { DispatcherMessage } from "./dispatcherMessage";

export class IntentExecutionMessage implements DispatcherMessage{
    executionId: string;
    job: GameTickPhase = GameTickPhase.ResultProcessingPhase;
    intents: Intent[];
    constructor(executionId: string, intents: Intent[]){
        this.executionId = executionId;
        this.intents = intents;

    }
}