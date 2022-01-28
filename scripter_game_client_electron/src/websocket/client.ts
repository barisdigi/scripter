
function createMapTopic(map: string) {
    return `maps/${map}/changes`
}
export default class WebSocketClient {
    ws: WebSocket | undefined;
    mapId: string;
    onConsoleMessageReceived: ((msg: string) => void)[];
    onMapChangesReceived: ((msg: string) => void)[];
    onError: ((msg: string) => void)[];
    constructor(mapId: string) {
        this.mapId = mapId;
        this.onConsoleMessageReceived = [];
        this.onMapChangesReceived = [];
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
        let onWebsocketClose = (event: Event) => {
            if (this.onError) {
                for (const func of this.onError) {
                    func("Screeps backend connection error. Will retry connection in 5 seconds.")
                }
            }
            setTimeout(() => this.setupWebsocket(), 5000)
            this.ws?.close();
        }
        this.ws = new WebSocket('ws://localhost:8000/players/45745457/maps/1',);

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