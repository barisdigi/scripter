import { Sprite } from "@inlet/react-pixi";
import { IPlayer } from "../../../types";
import circle from './circle.png'
interface IPlayerProps {
    player: IPlayer
}

function Player(props: IPlayerProps) {
    return (
        <Sprite image={circle} x={props.player.position.x * 20} y={props.player.position.y * 20} anchor={0} />
    );
}

export default Player;