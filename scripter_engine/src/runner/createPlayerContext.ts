import Intent from "../intents/intent";
import { VM } from "vm2";
import LogIntent from "../intents/log/logIntent";
import { Directions } from "../consts/directions";
import MoveIntent from "../intents/movement/moveIntent";

export function createContext(vm: VM, userInfo: { userId: string }, intents: Intent[]) {
    const console = {
        log(val: string) {
            const intent = new LogIntent(val, userInfo.userId, new Date().toISOString());
            intents.push(intent);
        }
    }

    const player = {
        move: (direction: Directions) => {
            const intent = new MoveIntent(userInfo.userId, direction);
            intents.push(intent);
        }
    }
    vm.freeze(Directions.NORTH, "NORTH");
    vm.freeze(Directions.SOUTH, "SOUTH");
    vm.freeze(Directions.WEST, "WEST");
    vm.freeze(Directions.EAST, "EAST");
    vm.freeze(player, "Player");
    vm.freeze(console, 'console');
}

