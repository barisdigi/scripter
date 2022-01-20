
export enum IntentTypes{
    Log,
    Move
}
export enum IntentProcessTypes {
    Player,
}
export default interface Intent{
    type: IntentTypes;
    context: IntentProcessTypes;

}