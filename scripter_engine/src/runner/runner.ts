import RedisWrapper from '../../../shared/redis/client'
import { NodeVM, } from 'vm2';
import constants, { GameTickPhase } from '../../../shared/constants/constants';
import Logger from '../logger/logger';
import Intent, { IntentTypes } from '../intents/intent';
import LogIntent from '../intents/log/logIntent';
import MongoWrapper from '../../../shared/mongodb/client';
import { createContext } from './createPlayerContext';
import MoveIntent from '../intents/movement/moveIntent';
import { ScriptExecutionMessage } from '../../../shared/redis/messages/scriptExecutionMessage';
import { DispatcherMessage } from '../../../shared/redis/messages/dispatcherMessage';
import { IntentExecutionMessage } from '../../../shared/redis/messages/intentExecutionMessage';
import { UnorderedBulkOperation } from 'mongodb';

const logger = new Logger()
const redisClient = new RedisWrapper()
const redisSubscriber = new RedisWrapper()
const hostChannel = process.argv[2];
const runnerId = process.argv[3];
const mongo = new MongoWrapper()

let intents: Intent[] = []
const ext = { exports: "", intents };
const userInfo: { userId: string | undefined } = {
    userId: undefined
}

const vm = new NodeVM({ sandbox: { ext }, console: "off", wasm: false, });

process.on('SIGINT', () => {
    process.exit()
});

async function getScriptToRun(message: string, channel: string) {
    const messageObj: DispatcherMessage = JSON.parse(message)
    const executionId = messageObj.executionId;
    const job = messageObj.job;
    if (job === GameTickPhase.ScriptPhase) {
        const mess: ScriptExecutionMessage = messageObj as ScriptExecutionMessage;
        const startTimestamp = new Date().getTime();
        intents = []
        userInfo.userId = mess.player.playerId;
        let timedOut = false;
        try {
            createContext(vm, userInfo, intents);
            const result = vm.run(mess.player.script);
        } catch (e) {
            timedOut = true;
        } finally {
            const endTimestamp = new Date().getTime();
            const timeInMilliseconds = (endTimestamp - startTimestamp);
            logger.debug(`Script processing for user ${mess.player.playerId} ended in ${timeInMilliseconds} milliseconds`)
            redisClient.increaseBy(constants.TotalScriptExecutionTimeKey, timeInMilliseconds)
            redisClient.increaseBy(constants.TotalNumberOfScriptExecutionsKey, 1)
            redisClient.push(constants.ResultsToProcess, JSON.stringify(intents))
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:${timedOut}`)
        }
    } else {
        const mess: IntentExecutionMessage = messageObj as IntentExecutionMessage;
        const bulkPlayers: UnorderedBulkOperation = mongo.initializeUnorderedBulkOpForPlayer();
        try {
            const intentsToProcess: any[] = mess.intents
            const logIntents = intentsToProcess.filter((el: Intent) => el.type === IntentTypes.Log)
            logIntents.PublishLogs(redisClient);
            if (intentsToProcess.length) {
                for (const intentObj of intentsToProcess) {
                    switch (intentObj.type) {
                        case IntentTypes.Move:
                            const move = MoveIntent.fromJSObject(intentObj);

                            // TODO: Send this to the client
                            // TODO: Check if the tile the player is moving to is actually movable
                            move.addDbOperation(bulkPlayers)
                        default:
                            break;
                    }
                }
            }
        } catch (e) {
            logger.error(JSON.stringify(e));
        } finally {
            if (bulkPlayers.batches.length) {
                bulkPlayers.execute();
            }
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