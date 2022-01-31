import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import axios from "axios";
import { MutableRefObject, useRef } from "react";
import { useRecoilState } from "recoil";
import { editorManagerAtom } from "../../../recoilStates";
import { IEditorManager } from "../../../types";

const username = "45745457"

function LeftPanel() {
    const [editorManager, setEditorManager] = useRecoilState(editorManagerAtom);
    const editorManagerRef: MutableRefObject<IEditorManager | undefined> = useRef(undefined);
    editorManagerRef.current = editorManager;
    function changeFile(fileName: string) {
        if (editorManagerRef.current && editorManagerRef.current.changeFile) {
            editorManagerRef.current.changeFile(fileName);
        }
    }
    function cleanConsole() {
        if (editorManagerRef.current && editorManagerRef.current.cleanConsole) {
            editorManagerRef.current.cleanConsole();
        }
    }
    function editScript() {
        if (editorManagerRef.current && editorManagerRef.current.getScript) {
            let script = editorManagerRef.current.getScript();
            axios.put(`http://localhost:8000/users/${username}/script`, { script: script })
                .then(response => {
                    console.log(response)
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
    return (
        <Menu >
            <MenuItem icon="console" text="Console">
                <MenuItem icon="eye-open" text="Open" onClick={() => changeFile('console')} />
                <MenuItem icon="clean" text="Clean" onClick={cleanConsole} />
            </MenuItem>
            <MenuDivider />
            <MenuItem icon="cloud-upload" text="Commit Changes" onClick={editScript} />
            <MenuDivider />
            <MenuItem icon="document" text="main.js" onClick={() => changeFile('script')} />
            <MenuItem icon="document-open" text="New File" disabled />
        </Menu>
    );
}

export default LeftPanel;