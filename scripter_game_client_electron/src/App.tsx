import { useEffect, useRef, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Position, Toaster, Toast, Intent } from "@blueprintjs/core";
import WebSocketClient from './websocket/client';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import { Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import { getCompletionModel } from './providers/completionProvider';
import bunnyImg from "./components/gameObjects/bunny.png";
import circle from "./components/gameObjects/circle.png";
import { Stage, Sprite, Graphics } from "@inlet/react-pixi";
import Viewport, { resizeViewport } from './components/viewport/viewport';
import React from 'react';

const username = "45745457"
const files: any = {
  "script": {
    name: "script",
    language: "javascript",
    value: "",
    renderValidationDecorations: 'editable',
    readOnly: false,
    currentValue: ""
  },
  "console": {
    name: "console",
    value: "",
    renderValidationDecorations: 'off',
    readOnly: true,
    currentValue: ""
  }
}
const radios = [
  { name: 'Console', value: 'console' },
  { name: 'Script', value: 'script' }
];
loader.config({ paths: { vs: "vs" } });
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
  const editorRef: any = useRef(undefined);
  const monacoRef: any = useRef(undefined);
  const toasterRef: any = useRef(undefined);

  const [toasts, setToasts] = useState([]);
  const [radioValue, setRadioValue] = useState('console');
  const [ws, setWs] = useState<WebSocketClient | undefined>(undefined);
  const file: any = files[radioValue];
  const renderValidationDecorations: 'editable' | 'off' = files[radioValue].renderValidationDecorations
  const editorReadOnly: boolean = files[radioValue].readOnly
  const { height, width } = useWindowDimensions();
  const [gameConsoleHeight, setGameConsoleHeight] = useState((height / 4) * 3);
  const [gameState, setGameState] = useState({ players: [] })
  const options = {
    selectOnLineNumbers: true,
    renderValidationDecorations: renderValidationDecorations,
    readOnly: editorReadOnly

  };
  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(getCompletionModel().join('\n'), 'filename/facts.d.ts');
    // Register a new language
    monaco.languages.register({ id: 'consoleLogLanguage' });
    // Register a tokens provider for the language so that it is empty
    monaco.editor.setModelLanguage(monaco.editor.getModels()[0], "consoleLogLanguage")
  }
  function getScript() {
    axios.get(`http://localhost:8000/users/${username}/script`)
      .then(response => {
        if (monacoRef && monacoRef.current && monacoRef.current.editor.getModels()[1]) {
          const model = monacoRef.current.editor.getModels()[1]
          const lineCount = model.getLineCount();
          const lastLineLength = model.getLineMaxColumn(lineCount);
          const range = new monaco.Range(
            lineCount,
            lastLineLength,
            lineCount,
            lastLineLength
          );

          let res = model.pushEditOperations('', [
            { range, text: response.data.message }
          ])
          editorRef.current.pushUndoStop();
        } else {
          files.script.value = response.data.message;
        }
      })
      .catch(error => {
        toasterRef.current.show({
          icon: "warning-sign",
          message: "Unable retrieve script, please try again later",
          timeout: 0,
          intent: Intent.DANGER,
          action: {
            onClick: getScript,
            text: "Retry",
          },
        });
      });
  }
  useEffect(() => {
    if (!ws) {
      getScript();
      const myws = new WebSocketClient("1")
      let onMessage = function (message: string) {
        const messageObj = JSON.parse(message);
        console.log(messageObj)
        if (messageObj.logs) {
          if (editorRef && editorRef.current) {
            const model = monacoRef.current.editor.getModels()[0]
            const lineCount = model.getLineCount();
            const lastLineLength = model.getLineMaxColumn(lineCount);

            const range = new monaco.Range(
              lineCount,
              lastLineLength,
              lineCount,
              lastLineLength
            );
            const logs: { range: monaco.Range; text: string; }[] = []
            messageObj.logs.forEach((logMessage: { time: string, message: string }) => {
              let dateObj = new Date(logMessage.time)
              let dateTimeString = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`

              logs.push(
                { range, text: `[${dateTimeString}] : ${logMessage.message}\n` }
              )
            });
            let res = model.pushEditOperations('', logs)
            editorRef.current.pushUndoStop();
          }
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
  function editScript() {
    if (editorRef && editorRef.current) {
      const model = monacoRef.current.editor.getModels()[1]
      axios.put(`http://localhost:8000/users/${username}/script`, { script: model.getValue() })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
  function cleanConsole() {
    if (editorRef && editorRef.current) {
      const model = monacoRef.current.editor.getModels()[0]
      model.setValue("");
    }
  }
  function onResize(_: any, y: any,) {
    if (y) {
      setGameConsoleHeight(height - y.size.height)
      resizeViewport(y.size.width, y.size.height)
    }

  }
  const drawBorder = React.useCallback(g => {
    g.lineStyle(10, 0xff0000)
    g.drawRect(0, 0, 2000, 2000)
  }, [])
  return (
    <Container className="vh-100 d-flex flex-column bp3-dark" style={{ height: "100%", width: "100%", margin: 0, padding: 0, maxWidth: "100%" }}>
      <Toaster position={Position.BOTTOM_RIGHT} usePortal ref={toasterRef}>
        {toasts.map(toast => <Toast {...toast} />)}
      </Toaster>
      <Row className='g-0' style={{ width: "100%", height: gameConsoleHeight, maxWidth: "100%" }}>
        <Stage width={width} height={gameConsoleHeight} options={{ backgroundColor: 0x1e1e1e }} >
          <Viewport width={width} height={(height / 4) * 3}>
            <Graphics draw={drawBorder} />
            {gameState.players.forEach((player) => {
              <Sprite image={circle} x={180} y={180} anchor={0.5} />
            })}
            <Sprite image={bunnyImg} x={20} y={20} anchor={0.5} />
          </Viewport>
        </Stage>
      </Row>
      <ResizableBox height={height / 4} width={width} minConstraints={[width, height / 4]} maxConstraints={[Infinity, height * 0.8]} resizeHandles={['n']} axis='y' onResize={onResize} handle={handle()}>
        <Row className="h-100 g-0" >
          <Col className='g-0' xs="auto" style={{ backgroundColor: "#1e1e1e" }}>
            <Menu >
              <MenuItem icon="console" text="Console">
                <MenuItem icon="eye-open" text="Open" onClick={() => setRadioValue('console')} />
                <MenuItem icon="clean" text="Clean" onClick={cleanConsole} />
              </MenuItem>
              <MenuDivider />
              <MenuItem icon="cloud-upload" text="Commit Changes" onClick={editScript} />
              <MenuDivider />
              <MenuItem icon="document" text="main.js" onClick={() => setRadioValue('script')} />
              <MenuItem icon="document-open" text="New File" disabled />
            </Menu>
          </Col>
          <Col style={{ height: "100%" }}>
            <Editor
              key="Editor"
              height={"100%"}
              language="javascript"
              theme="vs-dark"
              options={options}
              path={file.name}
              defaultLanguage={file.language}
              defaultValue={file.value}
              value={file.currentValue}
              onMount={handleEditorDidMount}
            />
          </Col>

        </Row>
      </ResizableBox>
    </Container>

  )
}
export default App;