import { Graphics, Stage, Sprite } from "@inlet/react-pixi";
import React from "react";
import Viewport from "./viewport/viewport";
import circle from "./gameObjects/circle.png";
import { IPlayer } from "../../types";

interface IGameProps {
    players: IPlayer[]
    map: any
    gameConsoleHeight: number
    gameConsoleWidth: number
    windowHeight: number
}

function Game(props: IGameProps) {
    const drawGrid = React.useCallback((g) => {
        if (props.map) {
            let currentMap: { size: { x: number, y: number } } = props.map;
            for (let x = 0; x < currentMap.size.x; x++) {
                for (let y = 0; y < currentMap.size.y; y++) {
                    g.lineStyle(1, 0x555956)
                    g.drawRect(x * 20, y * 20, 20, 20)

                }
            }
        }
    }, [props.map])
    return (
        <Stage renderOnComponentChange={true} width={props.gameConsoleWidth} height={props.gameConsoleHeight} options={{ backgroundColor: 0x1e1e1e }}  >
            {props.map ? <Viewport width={props.gameConsoleWidth} height={(props.windowHeight /4) * 3} map={props.map} >
                <Graphics draw={drawGrid} />
                {
                    props.players.map((player: IPlayer) => {
                        return <Sprite image={circle} x={player.position.x * 20} y={player.position.y * 20} anchor={0} />
                    })
                }
            </Viewport> : undefined}
        </Stage>

    );
}

export default Game;