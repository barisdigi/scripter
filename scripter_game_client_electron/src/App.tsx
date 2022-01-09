import { useEffect, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import Unity, { UnityContext } from "react-unity-webgl";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ToggleButton from 'react-bootstrap/ToggleButton'
import Button from 'react-bootstrap/Button'


const files: any = {
  "script": {
    name: "script",
    language: "javascript",
    value: "Loading Script...",
    renderValidationDecorations: 'editable'
  },
  "console": {
    name: "console",
    value: "Loading Console...",
    renderValidationDecorations: 'off'
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
  const [radioValue, setRadioValue] = useState('console');

  const file: any = files[radioValue];
  const renderValidationDecorations: 'editable' | 'off' = files[radioValue].renderValidationDecorations
  const { height } = useWindowDimensions();
 const options = {
   selectOnLineNumbers: true,
   renderValidationDecorations: renderValidationDecorations
  };
 return(
    <Container className="vh-100 d-flex flex-column " style={{height: "100%", width: "100%", margin: 0, padding: 0, maxWidth: "100%"}}>
      <Row className='g-0' style={{width: "100%", height: height/2, maxWidth: "100%"}}>
       <Unity style={{width: "100%", height: height/2}} unityContext={unityContext} />
       </Row>
       <Row className='g-0' style={{width: "100%"}}>
               <ButtonGroup >
        <Button variant="secondary">Commit</Button>
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
          height={"100%"}
          language="javascript"
          theme="vs-dark"
          options={options}
          path={file.name}
          defaultLanguage={file.language}
          defaultValue={file.value}
        />
      </Row>
      </Container>

 )
}
export default App;