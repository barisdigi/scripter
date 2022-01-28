export enum GameTickPhase {
    ScriptPhase,
    ResultProcessingPhase
}

const contants = {
    TickTimer: 1000,
    TickCheckInterval: 10,
    DispatchersKey: 'dispatchers',
    TickCountKey: "CurrentTickCount",
    ScriptsToProcess: "ScriptsToProcess",
    DispatchersKeepaliveSendInterval: 5000,
    DispatcherKeepAliveTimeout: 7500,
    Phase: "CurrentTickPhase",
    TickStartTimeKey: "LastTickStartTime",
    PhaseChangedChannel: "NewPhase",
    TotalScriptExecutionTimeKey: "TotalScriptExecutionTime",
    TotalNumberOfScriptExecutionsKey: "TotalNumberOfScriptExecutions",
    TotalResultProcessingTimeKey: "TotalResultProcessingTime",
    TotalResultProcessingNumberKey: "TotalResultProcessingNumber",
    MongoDBName: "playerScripts",
    MongoPlayerCollectionName: "players",
    MongoMapCollectionname: "maps",
    MapsToProcess: "mapsToProcess"
}


export default contants;