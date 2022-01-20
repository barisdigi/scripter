import Intent from "../../intents/intent";
import { GameTickPhase } from "../../constants";
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