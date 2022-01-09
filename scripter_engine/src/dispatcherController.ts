import MongoWrapper from './mongodb/mongodb';
import RedisWrapper from './redis/redis'
import Logger from './logger/logger';
import constants, {GameTickPhase} from './constants';

if (process.env.NODE_ENV !== 'production') {
     // tslint:disable-next-line
    require('dotenv').config()
}

const logger = new Logger()

const redisSubscriber = new RedisWrapper()
const redisSender = new RedisWrapper()

const mongo = new MongoWrapper()

const TickCountKey = constants.TickCountKey;
let currentPhase: GameTickPhase;
let tickCount: number;

async function addToMongoDB(){
    for (let index = 0; index < 500; index++) {
        await mongo.addPlayerScript("ext.exports = 25;")
    }
}

async function addAllFromMongoDbToRedisQueue() {
    const playerScripts: any[] = await mongo.getAllPlayerScripts();
    const scripts: string[] = playerScripts.map((obj) => {
        return JSON.stringify({
            script:obj.script,
            id: obj.id
        })
    })
    if(scripts.length){
        await redisSender.push(constants.ScriptsToProcess, scripts);
    }
}

async function checkIfScriptPhaseDone(){
    const dispatchers = await redisSender.hgetall(constants.DispatchersKey);
    const dispatchersList: any[] = [];
    const scriptsToRunLength = await redisSender.length(constants.ScriptsToProcess);
    for (const key of Object.keys(dispatchers)){
        dispatchersList.push(JSON.parse(dispatchers[key]));
    }

    const dispatchersWithTasks = dispatchersList.filter((dispatcher) => {

        const dispatcherTimedOut = (new Date().getTime() - new Date(dispatcher.keepAlive).getTime()) > constants.DispatcherKeepAliveTimeout;
        if (dispatcherTimedOut){
            logger.error(`Dispatcher ${dispatcher.id} timeout out! Deleting from registry!`)
            redisSender.hdel(constants.DispatchersKey, dispatcher.id)
        }
        return dispatcher.currentlyWorkingRunners > 0 && !dispatcherTimedOut
    })
    if (dispatchersWithTasks.length === 0 && scriptsToRunLength === 0){
        startResultProcessingPhase()

    }else{
        setTimeout(checkIfScriptPhaseDone, constants.TickCheckInterval)
    }
}

async function checkIfResultProcessingPhaseDone(){
    const dispatchers = await redisSender.hgetall(constants.DispatchersKey);
    const dispatchersList: any[] = [];
    const scriptsToRunLength = await redisSender.length(constants.ResultsToProcess);
    for (const key of Object.keys(dispatchers)) {
        dispatchersList.push(JSON.parse(dispatchers[key]));
    }

    const dispatchersWithTasks = dispatchersList.filter((dispatcher) => {

        const dispatcherTimedOut = (new Date().getTime() - new Date(dispatcher.keepAlive).getTime()) > constants.DispatcherKeepAliveTimeout;
        if (dispatcherTimedOut) {
            logger.error(`Dispatcher ${dispatcher.id} timeout out! Deleting from registry!`)
            redisSender.hdel(constants.DispatchersKey, dispatcher.id)
        }
        return dispatcher.currentlyWorkingRunners > 0 && !dispatcherTimedOut
    })
    if (dispatchersWithTasks.length === 0 && scriptsToRunLength === 0) {
        const LastTickStartTime = await redisSender.get(constants.TickStartTimeKey)
        const timeSinceLastTickStart = new Date().getTime() - new Date(LastTickStartTime).getTime();
        if (timeSinceLastTickStart < constants.TickTimer ){
            setTimeout(checkIfResultProcessingPhaseDone, constants.TickTimer - timeSinceLastTickStart)
        } else{
            startNewTick()
        }

    } else {
        setTimeout(checkIfResultProcessingPhaseDone, constants.TickCheckInterval)
    }
}

async function startResultProcessingPhase(){
    logger.debug(`Starting result processing phase for tick ${tickCount}`)
    await redisSender.set(constants.Phase, GameTickPhase[GameTickPhase.ResultProcessingPhase])
    checkIfResultProcessingPhaseDone()
}

async function startNewTick(){
    tickCount = tickCount + 1;
    logger.info(`Starting tick number ${tickCount}`)
    redisSender.set(constants.Phase, GameTickPhase[GameTickPhase.ScriptPhase])
    redisSender.set(constants.TickStartTimeKey, new Date().toISOString())
    await addAllFromMongoDbToRedisQueue();
    await redisSender.set(TickCountKey, (tickCount).toString())

    // Check once after timer is done if every dispatcher is done
    setTimeout(checkIfScriptPhaseDone, constants.TickCheckInterval)
}

async function main() {
    await mongo.connect();
    currentPhase = GameTickPhase[await redisSender.get(constants.Phase) as keyof typeof GameTickPhase];

    if(currentPhase === undefined || currentPhase === null){
        await redisSender.set(constants.Phase, GameTickPhase[GameTickPhase.ScriptPhase])
    }

    const currentTickCountRedis = await redisSender.get(TickCountKey);
    if (!currentTickCountRedis){
        redisSender.set(TickCountKey, (0).toString());
    } else{
        tickCount = Number(currentTickCountRedis)
    }
    if(currentPhase === GameTickPhase.ScriptPhase){
        checkIfScriptPhaseDone()
    } else{
        checkIfResultProcessingPhaseDone()
    }
}


if (require.main === module) {
    main();

}
