import { GameTickPhase } from "../../constants";

export interface DispatcherMessage{
    executionId: string;
    job: GameTickPhase;
}