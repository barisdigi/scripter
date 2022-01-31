import { useEffect, useRef, useState } from 'react';
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getCompletionModel } from '../../../providers/completionProvider';
import { ILogsMessageObject, ILogObject, IEditorManager } from '../../../types'
import { atom, RecoilState, useRecoilState } from 'recoil';
import { editorManagerAtom, toasterManagerAtom } from '../../../recoilStates'
import axios from 'axios';
import { Intent } from '@blueprintjs/core';
import files from './constants';

loader.config({ paths: { vs: "vs" } });

const username = "45745457"

function ScripterEditor() {
    const editorRef: any = useRef(undefined);
    const monacoRef: any = useRef(undefined);
    const [currentFileName, setCurrentFileName] = useState('console');
    const renderValidationDecorations: 'editable' | 'off' = files[currentFileName].renderValidationDecorations
    const editorReadOnly: boolean = files[currentFileName].readOnly
    const file: any = files[currentFileName];

    const [editorManager, setEditorManager] = useRecoilState(editorManagerAtom);
    const [toastManager, setToastManager] = useRecoilState(toasterManagerAtom)

    const options = {
        selectOnLineNumbers: true,
        renderValidationDecorations: renderValidationDecorations,
        readOnly: editorReadOnly

    };
    function getScript() {
        axios.get(`http://localhost:8000/users/${username}/script`)
            .then(response => {
                setScript(response.data.message)
            })
            .catch(error => {
                if (toastManager && toastManager.showToast) {
                    toastManager.showToast({
                        icon: "warning-sign",
                        message: "Unable retrieve script, please try again later",
                        timeout: 0,
                        intent: Intent.DANGER,
                        action: {
                            onClick: getScript,
                            text: "Retry",
                        },
                    })
                }
            });
    }
    function getCurrentEditorScript() {
        const model = monacoRef.current.editor.getModels()[1];
        return model.getValue();
    }
    function changeFile(newFile: string) {
        setCurrentFileName(newFile)
    }
    function setScript(newScript: string) {
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
                { range, text: newScript }
            ])
            editorRef.current.pushUndoStop();
        } else {
            files.script.value = newScript;
        }
    }
    function cleanConsole() {
        if (editorRef && editorRef.current) {
            const model = monacoRef.current.editor.getModels()[0]
            model.setValue("");
        }
    }
    function logObjectToString(logObject: ILogObject) {
        let dateObj = new Date(logObject.time)
        let dateTimeString = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`
        return `[${dateTimeString}] : ${logObject.message}\n`
    }
    function addLineToConsole(logMessageObj: ILogsMessageObject) {
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
            logMessageObj.logs.forEach((logMessage) => {
                let messageString = logObjectToString(logMessage);
                logs.push({ range, text: messageString })
            });
            let res = model.pushEditOperations('', logs)
            editorRef.current.pushUndoStop();
        }
    }

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setEditorManager({
            addLineToConsole,
            cleanConsole,
            changeFile,
            setScript,
            getScript: getCurrentEditorScript
        })
        getScript()
        monaco.languages.typescript.javascriptDefaults.addExtraLib(getCompletionModel().join('\n'), 'filename/facts.d.ts');
        // Register a new language
        monaco.languages.register({ id: 'consoleLogLanguage' });
        // Register a tokens provider for the language so that it is empty
        monaco.editor.setModelLanguage(monaco.editor.getModels()[0], "consoleLogLanguage")
    }

    return (
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
    )
}
export default ScripterEditor;