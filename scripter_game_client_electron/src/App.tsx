import { MutableRefObject, useEffect, useRef, useState } from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Position, Toaster, Toast, Intent } from "@blueprintjs/core";
import WebSocketClient from './services/websocket/client';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import Viewport, { resizeViewport } from './components/game/viewport/viewport';
import React from 'react';
import ScripterEditor from './components/codeEditor/ScripterEditor/scripterEditor';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { editorManagerAtom, toasterManagerAtom } from './recoilStates';
import { IEditorManager, IPlayer } from './types';
import LeftPanel from './components/codeEditor/LeftPanel/leftPanel';
import { ToastProps } from 'react-bootstrap';
import Game from './components/game/game';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

function App() {

  const [editorManager, setEditorManager] = useRecoilState(editorManagerAtom);
  const editorManagerRef: MutableRefObject<IEditorManager | undefined> = useRef(undefined);
  editorManagerRef.current = editorManager;
  const { height, width } = useWindowDimensions();
  const [gameConsoleHeight, setGameConsoleHeight] = useState((height / 4) * 3);
  const toasterRef: any = useRef(undefined);
  const [toasts, setToasts] = useState([]);
  const setToastManager = useSetRecoilState(toasterManagerAtom)
  setToastManager({
    showToast
  })
  function showToast(toast: ToastProps) {

    toasterRef.current.show(toast);
  }
  const [map, setMap] = useState(undefined);
  const [ws, setWs] = useState<WebSocketClient | undefined>(undefined);

  const [players, setPlayers] = useState([])
  const playersRef = useRef([]);
  playersRef.current = players;
  const [, updateState] = React.useState();
  //@ts-ignore
  const forceUpdate = React.useCallback(() => updateState({}), []);
  function getMap() {
    axios.get(`http://localhost:8000/maps/1`)
      .then(response => {
        setPlayers(response.data.players)
        setMap(response.data.map)

      }).catch(error => {
        toasterRef.current.show({
          icon: "warning-sign",
          message: "Unable retrieve script, please try again later",
          timeout: 0,
          intent: Intent.DANGER,
          //TODO: Add retry action here
          action: {
            text: "Retry",
          },
        });
      });
  }

  let processChanges = (changes: any) => {
    let playerChanges = changes.filter((change: { context: string }) => { return change.context === "PLAYER" })

    for (const playerChange of playerChanges) {
      let playerIndex = playersRef.current.findIndex((player: IPlayer) => {
        return player.playerId === playerChange.playerId
      })
      let player: IPlayer = playersRef.current[playerIndex];
      player.position.x = playerChange.result.newX;
      player.position.y = playerChange.result.newY;
      setPlayers(playersRef.current)
    }
    forceUpdate();
  }
  useEffect(() => {

    if (!ws) {
      getMap();
      const myws = new WebSocketClient("1")
      let onMessage = function (message: string) {
        const messageObj = JSON.parse(message);
        if (messageObj.logs) {
          if (editorManagerRef.current && editorManagerRef.current.addLineToConsole) {
            editorManagerRef.current.addLineToConsole(messageObj)
          }

        }
        else if (messageObj.changes) {
          processChanges(messageObj.changes)
        }
      }
      let onError = function (message: string) {
        toasterRef.current.show({
          icon: "warning-sign",
          message: message,
          timeout: 5000,
          intent: Intent.DANGER
        });
      }
      myws.onConsoleMessageReceived.push(onMessage)
      myws.onError.push(onError)
      setWs(myws)
    }
  })
  const handle = () => {
    return <div className="handle" />
  }
  function onResize(_: any, y: any,) {
    if (y) {
      setGameConsoleHeight(height - y.size.height)
      resizeViewport(y.size.width, y.size.height)
    }
  }
  const drawGrid = React.useCallback((g) => {
    if (map) {
      let currentMap: { size: { x: number, y: number } } = map;
      for (let x = 0; x < currentMap.size.x; x++) {
        for (let y = 0; y < currentMap.size.y; y++) {
          g.lineStyle(1, 0x555956)
          g.drawRect(x * 20, y * 20, 20, 20)

        }
      }
    }
  }, [map])
  return (
    <Container className="vh-100 d-flex flex-column bp3-dark" style={{ height: "100%", width: "100%", margin: 0, padding: 0, maxWidth: "100%" }}>
      <Toaster position={Position.BOTTOM_RIGHT} usePortal ref={toasterRef}>
        {toasts.map(toast => <Toast {...toast} />)}
      </Toaster>
      <Row className='g-0' style={{ width: "100%", height: gameConsoleHeight, maxWidth: "100%" }} >
        <Game windowHeight={height} gameConsoleHeight={gameConsoleHeight} gameConsoleWidth={width} players={players} map={map}></Game>
      </Row>
      <ResizableBox height={height / 4} width={width} minConstraints={[width, height / 4]} maxConstraints={[Infinity, height * 0.8]} resizeHandles={['n']} axis='y' onResize={onResize} handle={handle()}>
        <Row className="h-100 g-0" >
          <Col className='g-0' xs="auto" style={{ backgroundColor: "#1e1e1e" }}>
            <LeftPanel />
          </Col>
          <Col style={{ height: "100%" }}>
            <ScripterEditor />
          </Col>

        </Row>
      </ResizableBox>
    </Container>

  )
}
export default App;