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

          let res = model.pushEditOperations('', [
            { range, text: `${message}\n` }
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

  return (
    <Container className="vh-100 d-flex flex-column " style={{ height: "100%", width: "100%", margin: 0, padding: 0, maxWidth: "100%" }}>
      <Row className='g-0' style={{ width: "100%", height: height, maxWidth: "100%" }}>
      </Row>
      <ResizableBox height={height/4} width={width} minConstraints={[width, height/4]} maxConstraints={[Infinity, height * 0.8]} resizeHandles={['n']} axis='y' handle={handle()}>
      <Row className="h-100 g-0" >
      <Col className='g-0' xs={1} style={{backgroundColor: "#1e1e1e"}}>
        <ButtonGroup vertical style={{width:"100%"}}>
          <Button onClick={editScript} variant="secondary">Commit</Button>
          {radios.map((radio, idx) => (
            <ToggleButton
              size="sm"
              key={idx}
              id={`radio-${idx}`}
              type="radio"
              variant="secondary"
              name="radio"
              value={radio.value}
              checked={radioValue === radio.value}
              onChange={(e) => setRadioValue(e.currentTarget.value)}
            >
              {radio.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Col>
        <Col style={{height: "100%"}}>
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