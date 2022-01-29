export enum Directions {
    NORTH,
    SOUTH,
    EAST,
    WEST
}
export class DirectionCoordinateManager {
    static getDirectionVectors(direction: Directions) {
        let x = 0;
        let y = 0;

        switch (direction) {
            case Directions.NORTH:
                y--
                break;
            case Directions.SOUTH:
                y++
                break;
            case Directions.EAST:
                x++;
                break;
            case Directions.WEST:
                x--;
                break;
            default:
                break;
        }
        return {x, y}
    }
}