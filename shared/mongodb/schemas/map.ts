export class Map {
    mapId: string;
    size: { x: number, y: number };
    constructor(obj: Map) {
        this.mapId = obj.mapId;
        this.size = obj.size;
    }
}