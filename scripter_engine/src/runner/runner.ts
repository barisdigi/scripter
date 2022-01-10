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
const timeout = 10000;
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
        try{
            const userId = messageObj.userId;
            const vm = new VM({ sandbox: { ext, console: { log: (val: string) => { intents.push(new LogIntent(val, userId, new Date().toISOString())) } } },timeout});
            const compiled = new VMScript(messageObj.script)
            const result = vm.run(compiled);
            await redisClient.push(constants.ResultsToProcess, JSON.stringify(intents))
        } catch{
            timedOut = true;
        } finally{
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:${timedOut}`)
        }
    } else{
        const intents = messageObj.intents
        if(intents.length ){
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
        redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:false`)
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