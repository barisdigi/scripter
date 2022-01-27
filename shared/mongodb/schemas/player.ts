export class Player {
    script: string;
    playerId: string;
    position: { x: number, y: number, mapId: string };
    constructor(obj: Player) {
        this.script = obj.script;
        this.playerId = obj.playerId;
        this.position = obj.position;
    }
}