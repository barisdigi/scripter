import { useEffect, useRef, useState } from 'react';
import Editor, { loader, Monaco } from "@monaco-editor/react";
import Unity, { UnityContext } from "react-unity-webgl";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'
import WebSocketClient from './services/websocket/Websocket';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import axios from 'axios';
const username = "45745457"
const files: any = {
  "script": {
    name: "script",
    language: "javascript",
    value: "",
    renderValidationDecorations: 'editable',
    currentValue:""
  },
  "console": {
    name: "console",
    value: "",
    renderValidationDecorations: 'off',
    currentValue:""
  }
}
  const radios = [
    { name: 'Console', value: 'console' },
    { name: 'Script', value: 'script' }
  ];

const unityContext = new UnityContext({
  loaderUrl: "./client_build/Build/client_build.loader.js",
  dataUrl: "./client_build/Build/client_build.data",
  frameworkUrl: "./client_build/Build/client_build.framework.js",
  codeUrl: "./client_build/Build/client_build.wasm",
  
});
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
  const { height } = useWindowDimensions();
  const options = {
    selectOnLineNumbers: true,
    renderValidationDecorations: renderValidationDecorations,

  };
  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor; 
    monacoRef.current = monaco;
  }
  useEffect(() => {
    if(!ws){
      const myws = new WebSocketClient()
      axios.get(`http://localhost:8000/users/${username}/script`)
        .then(response => {
          if(monacoRef && monacoRef.current && monacoRef.current.editor.getModels()[1]){
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
                {range, text: response.data }
            ])
            editorRef.current.pushUndoStop();
            } else{
              files.script.value = response.data;
            }
        })
        .catch(error => {
            console.log(error);
        });
      let onMessage = function (message: string) {
    
        if(editorRef && editorRef.current){
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
              {range, text: `\n${message}` }
          ])
          editorRef.current.pushUndoStop();
        }
      }
      myws.onConsoleMessageReceived.push(onMessage) 
      setWs(myws)
    }

  })
function editScript(){
  
  if(editorRef && editorRef.current){
    const model = monacoRef.current.editor.getModels()[1]
    axios.put(`http://localhost:8000/users/${username}/script`, {script: model.getValue()})
    .then(response => {
        console.log(response)
    })
    .catch(error => {
        console.log(error);
    });
  }

}

 return(
    <Container className="vh-100 d-flex flex-column " style={{height: "100%", width: "100%", margin: 0, padding: 0, maxWidth: "100%"}}>
      <Row className='g-0' style={{width: "100%", height: height/2, maxWidth: "100%"}}>
       <Unity style={{width: "100%", height: height/2}} unityContext={unityContext} />
       </Row>
       <Row className='g-0' style={{width: "100%"}}>
               <ButtonGroup >
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
      </Row>
       <Row className="h-100 g-0">

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
      </Row>
      </Container>

 )
}
export default App;