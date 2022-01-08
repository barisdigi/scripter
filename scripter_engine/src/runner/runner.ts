import RedisWrapper from '../redis/redis'
import { VM, VMScript } from 'vm2';
import constants, { GameTickPhase } from '../constants';

const redisClient = new RedisWrapper()
const redisSubscriber = new RedisWrapper()
const timeout = 10000;
const hostChannel = process.argv[2];
const runnerId = process.argv[3];

async function getScriptToRun (message: string, channel: string){

    const ext = { exports: "" };
    const messageObj = JSON.parse(message)
    const executionId = messageObj.id;
    const job = GameTickPhase[messageObj.job as keyof typeof GameTickPhase];
    if(job === GameTickPhase.ScriptPhase){
        let timedOut = false;
        try{
            const vm = new VM({sandbox: { ext },timeout});
            const compiled = new VMScript(messageObj.script)
            const result = vm.run(compiled);
            await redisClient.push(constants.ResultsToProcess, JSON.stringify({ tick: await redisClient.get(constants.TickCountKey) ,result}))
        } catch{
            timedOut = true;
        } finally{
            redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:${timedOut}`)
        }
    } else{
        redisClient.publish(hostChannel, `ready:${runnerId}:${executionId}:false`)
    }
}

async function main() {

    await redisSubscriber.subscribe(`${hostChannel}:${runnerId}`, getScriptToRun)
    redisClient.publish(hostChannel, `ready:${runnerId}`)
}
if (require.main === module) {
    main();
}