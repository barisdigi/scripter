import { useEffect, useRef, useState } from 'react';
import Editor, { loader, Monaco } from "@monaco-editor/react";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'
import WebSocketClient from './services/websocket/Websocket';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import { Menu, Classes, MenuItem, MenuDivider, Icon } from '@blueprintjs/core';

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
  const [radioValue, setRadioValue] = useState('console');
  const [ws, setWs] = useState<WebSocketClient | undefined>(undefined);
  const file: any = files[radioValue];
  const renderValidationDecorations: 'editable' | 'off' = files[radioValue].renderValidationDecorations
  const editorReadOnly: boolean = files[radioValue].readOnly
  const { height, width } = useWindowDimensions();
  const options = {
    selectOnLineNumbers: true,
    renderValidationDecorations: renderValidationDecorations,
    readOnly: editorReadOnly

  };
  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Register a new language
    monaco.languages.register({ id: 'consoleLogLanguage' });
    // Register a tokens provider for the language so that it is empty
    monaco.editor.setModelLanguage(monaco.editor.getModels()[0], "consoleLogLanguage")
  }
  useEffect(() => {
    if (!ws) {
      const myws = new WebSocketClient()
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
              { range, text: response.data }
            ])
            editorRef.current.pushUndoStop();
          } else {
            files.script.value = response.data;
          }
        })
        .catch(error => {
          console.log(error);
        });
      let onMessage = function (message: string) {
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
          let messageObj = JSON.parse(message);
          let dateObj = new Date(messageObj.time)
          let dateTimeString = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`
          let res = model.pushEditOperations('', [
            { range, text: `[${dateTimeString}] : ${messageObj.message}\n` }
          ])
          editorRef.current.pushUndoStop();
        }
      }
      myws.onConsoleMessageReceived.push(onMessage)
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

  return (
    <Container className="vh-100 d-flex flex-column bp3-dark" style={{ height: "100%", width: "100%", margin: 0, padding: 0, maxWidth: "100%" }}>
      <Row className='g-0' style={{ width: "100%", height: height, maxWidth: "100%" }}>
      </Row>
      <ResizableBox height={height / 4} width={width} minConstraints={[width, height / 4]} maxConstraints={[Infinity, height * 0.8]} resizeHandles={['n']} axis='y' handle={handle()}>
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
              <MenuItem icon="document-open" text="New File" />
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