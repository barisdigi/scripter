import { atom, RecoilState } from "recoil";
import { IEditorManager, IToaster } from "./types";

export const editorManagerAtom: RecoilState<IEditorManager> = atom({
    key: 'editorManager',
    default: {},
});

export const toasterManagerAtom: RecoilState<IToaster> = atom({
    key: 'toaster',
    default: {}
})