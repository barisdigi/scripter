import RedisWrapper from '../../../shared/redis/client'
import { NodeVM, } from 'vm2';
import constants, { GameTickPhase } from '../../../shared/constants/constants';
import Logger from '../../../shared/logger/logger';
import Intent, { IntentTypes } from '../intents/intent';
import LogIntent from '../intents/log/logIntent';
import MongoWrapper from '../../../shared/mongodb/client';
import { createContext } from './createPlayerContext';
import MoveIntent from '../intents/movement/moveIntent';
import { ScriptExecutionMessage } from '../../../shared/redis/messages/scriptExecutionMessage';
import { DispatcherMessage } from '../../../shared/redis/messages/dispatcherMessage';
import { IntentExecutionMessage } from '../../../shared/redis/messages/intentExecutionMessage';
import { UnorderedBulkOperation } from 'mongodb';
import { Map } from '../../../shared/mongodb/schemas/map';
import { Player } from '../../../shared/mongodb/schemas/player';

interface IPlayerExecObject {
    intents: Intent[]
    player: Player
}
function createMapTopic(map: Map) {
    return `maps/${map.mapId}/changes`
}
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
        intents = [];
        const resultObj = { intents, player: mess.player }
        userInfo.userId = mess.player.playerId;
        let timedOut = false;
        try {
            createContext(vm, userInfo, intents);
            const result = vm.run(mess.player.script);
        } catch (e) {
            logger.error(JSON.stringify(e))
            timedOut = true;
        } finally {
            const endTimestamp = new Date().getTime();
            const timeInMilliseconds = (endTimestamp - startTimestamp);
            logger.debug(`Script processing for user ${mess.player.playerId} ended in ${timeInMilliseconds} milliseconds`)
            redisClient.increaseBy(constants.TotalScriptExecutionTimeKey, timeInMilliseconds)
            redisClient.increaseBy(constants.TotalNumberOfScriptExecutionsKey, 1)
            redisClient.push(`resultsPerMap:${mess.player.position.mapId}`, JSON.stringify(resultObj))
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:${timedOut}`)
        }
    } else {
        const mess: IntentExecutionMessage = messageObj as IntentExecutionMessage;
        const allPlayers: IPlayerExecObject[] = (await redisClient.popAll(`resultsPerMap:${mess.mapIdToProcess}`)).map((elem) => { return JSON.parse(elem) })
        const bulkPlayers: UnorderedBulkOperation = mongo.initializeUnorderedBulkOpForPlayer();
        const map = new Map(JSON.parse(await redisClient.hget("maps", mess.mapIdToProcess)));
        const changes = []
        let allLogIntents: Intent[] = []
        try {
            for (const playerObj of allPlayers) {
                let lastMovement: MoveIntent | undefined;
                const intentsToProcess: any[] = playerObj.intents;
                const logIntents = intentsToProcess.filter((el: Intent) => el.type === IntentTypes.Log)
                allLogIntents = allLogIntents.concat(logIntents);
                if (intentsToProcess.length) {
                    for (const intentObj of intentsToProcess) {
                        switch (intentObj.type) {
                            case IntentTypes.Move:
                                const move = MoveIntent.fromJSObject(intentObj);
                                if (move.validate(map, playerObj.player)) {
                                    lastMovement = move;
                                }
                            default:
                                break;
                        }
                    }
                }
                if(lastMovement){
                    lastMovement.addDbOperation(bulkPlayers)
                    changes.push({
                        context: "PLAYER",
                        action: "MOVE",
                        playerId: playerObj.player.playerId,
                        result: {
                            ...lastMovement.getNewPositions(playerObj.player)
                        }
                    })
                }

            }
        } catch (e) {
            logger.error(JSON.stringify(e));
        } finally {
            if (bulkPlayers.batches.length) {
                bulkPlayers.execute();
            }
            // Publish changes for the map
            allLogIntents.PublishLogs(redisClient);
            if (changes.length) {
                redisClient.publish(createMapTopic(map), JSON.stringify({ changes }));
            }
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:false`);
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