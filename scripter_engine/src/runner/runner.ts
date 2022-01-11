import RedisWrapper from '../redis/redis'
import { NodeVM,} from 'vm2';
import constants, { GameTickPhase } from '../constants';
import Logger from '../logger/logger';
import Intent, { IntentTypes } from '../intents/intent';
import LogIntent from '../intents/log/logIntent';
import MongoWrapper from '../mongodb/mongodb';

const logger = new Logger()
const redisClient = new RedisWrapper()
const redisSubscriber = new RedisWrapper()
const hostChannel = process.argv[2];
const runnerId = process.argv[3];
const mongo = new MongoWrapper()

let intents: Intent[] = []
const ext = { exports: "", intents };
const userInfo: {userId: string | undefined} = {
    userId: undefined
}

const vm = new NodeVM({ sandbox: { ext }, console: "off", wasm: false, });


async function getScriptToRun (message: string, channel: string){
    const messageObj = JSON.parse(message)

    const executionId = messageObj.id;
    const job = GameTickPhase[messageObj.job as keyof typeof GameTickPhase];
    if(job === GameTickPhase.ScriptPhase){
        const startTimestamp = new Date().getTime();
        intents = []
        userInfo.userId = messageObj.userId;
        let timedOut = false;
        try {
            const console = { log (val: string) {
                const intent = new LogIntent(val, userInfo.userId, new Date().toISOString())
                intents.push(intent)
            } }
            vm.freeze(console, 'console');
            const result = vm.run(messageObj.script);
        } catch (e){
            timedOut = true;
        } finally{

            const endTimestamp = new Date().getTime();
            const timeInMilliseconds = (endTimestamp - startTimestamp);
            logger.debug(`Script processing for user ${messageObj.userId} ended in ${timeInMilliseconds} milliseconds`)
            redisClient.increaseBy(constants.TotalScriptExecutionTimeKey, timeInMilliseconds)
            redisClient.increaseBy(constants.TotalNumberOfScriptExecutionsKey, 1)
            redisClient.push(constants.ResultsToProcess, JSON.stringify(intents))
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:${timedOut}`)
        }
    } else{
        try{
            const intentsToProcess: any[] = messageObj.intents
            if(intentsToProcess.length){
                for (const intentObj of intentsToProcess){
                    switch (intentObj.type) {
                        case IntentTypes.Log:
                            const intent: LogIntent = new LogIntent(intentObj.message, intentObj.playerId, intentObj.time)
                            redisClient.publish(`console_logs/${intentObj.playerId}`, intent.messageWithTime)
                            break;

                        default:
                            break;
                    }
                }
            }
        }catch (e) {
            logger.error(JSON.stringify(e));
        } finally{
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:false`)
        }

    }
}

async function main() {
    await mongo.connect()
    await redisSubscriber.subscribe(`${hostChannel}:${runnerId}`, getScriptToRun)
    redisClient.publish(hostChannel, `ready:${runnerId}`)
}
if (require.main === module) {
    main();
}