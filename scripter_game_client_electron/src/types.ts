import { ToastProps } from "@blueprintjs/core"
export interface ILogObject {
    time: string
    message: string
}
export interface ILogsMessageObject {
    logs: ILogObject[]
}
export interface IEditorManager {
    addLineToConsole?: (logMessageObj: ILogsMessageObject) => void
    cleanConsole?: () => void
    changeFile?: (newFile: string) => void
    setScript?: (newScript: string) => void
    getScript?: () => string
}

export interface IToaster {
    showToast?: (toast: ToastProps) => void
}