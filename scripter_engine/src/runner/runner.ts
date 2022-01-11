import RedisWrapper from '../redis/redis'
import { VM, VMScript } from 'vm2';
import constants, { GameTickPhase } from '../constants';
import Logger from '../logger/logger';
import Intent, { IntentTypes } from '../intents/intent';
import LogIntent from '../intents/log/logIntent';
import MongoWrapper from '../mongodb/mongodb';

const logger = new Logger()
const redisClient = new RedisWrapper()
const redisSubscriber = new RedisWrapper()
const timeout = 500;
const hostChannel = process.argv[2];
const runnerId = process.argv[3];
const mongo = new MongoWrapper()


async function getScriptToRun (message: string, channel: string){
    const messageObj = JSON.parse(message)
    const executionId = messageObj.id;
    const job = GameTickPhase[messageObj.job as keyof typeof GameTickPhase];
    if(job === GameTickPhase.ScriptPhase){
        const intents: Intent[] = []
        const ext = { exports: "", intents };
        let timedOut = false;
        try {
            const userId = messageObj.userId;
            const vm = new VM({ sandbox: { ext },timeout});
            const console = { log (val: string) {
                const intent = new LogIntent(val, userId, new Date().toISOString())
                intents.push(intent)

            } }
            vm.freeze(console, 'console');
            const result = vm.run(messageObj.script);
        } catch{
            timedOut = true;
        } finally{
            redisClient.push(constants.ResultsToProcess, JSON.stringify(intents))
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:${timedOut}`)
        }
    } else{
        try{
            const intents: any[] = messageObj.intents
            if(intents.length){
                for (const intentObj of intents){
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