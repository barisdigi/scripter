
export enum IntentTypes{
    Log,
}
export enum IntentProcessTypes {
    Player,
}
export default interface Intent{
    type: IntentTypes;
    context: IntentProcessTypes;

}