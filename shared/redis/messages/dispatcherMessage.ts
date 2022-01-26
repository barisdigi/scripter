import { GameTickPhase } from "../../constants/constants";

export interface DispatcherMessage{
    executionId: string;
    job: GameTickPhase;
}