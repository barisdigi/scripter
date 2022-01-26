
export default class WebSocketClient {
    ws: WebSocket | undefined;
    onConsoleMessageReceived: ((msg: string) => void)[];
    onError: ((msg: string) => void)[];
    constructor() {
        this.onConsoleMessageReceived = [];
        this.onError = [];
        this.setupWebsocket();

    }
    setupWebsocket() {
        let onWebsocketMessage = (event: MessageEvent) => {
            if (this.onConsoleMessageReceived) {
                for (const func of this.onConsoleMessageReceived) {
                    func(event.data)
                }
            }
        }
        let onWebsockeError = (event: Event) => {
            if (this.onError) {
                for (const func of this.onError) {
                    func("Screeps backend connection error. Will retry connection in 5 seconds.")
                }
            }
            this.ws?.close();
        }
        let onWebsocketClose = (event: Event) => {
            if (this.onError) {
                for (const func of this.onError) {
                    func("Screeps backend connection error. Will retry connection in 5 seconds.")
                }
            }
            setTimeout(() => this.setupWebsocket(), 5000)
            this.ws?.close();
        }

        this.ws = new WebSocket('ws://localhost:8000/consolelogs/45745457',);

        this.ws.onopen = (event) => {
            if (this.ws) {
                this.ws.send(JSON.stringify({ event: "subscribe", data: "console" }));
            }

        };
        this.ws.onmessage = onWebsocketMessage;
        //this.ws.onerror = onWebsockeError;
        this.ws.onclose = onWebsocketClose;
    }

}