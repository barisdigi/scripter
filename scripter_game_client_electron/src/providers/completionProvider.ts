
export function getCompletionModel() {
    const console = [
        `
        enum DIRECTION {
            NORTH,
            SOUTH,
            EAST,
            WEST
        }
        declare namespace Player {
            export function move(direction: DIRECTION): void{} 
        }
        `
    ]
    return console
}