
export default class WebSocketClient{
    #ws: WebSocket;
    onConsoleMessageReceived: ((msg:string) => void)[];
    constructor(){
        let onWebsocketMessage = (event: MessageEvent) => {
            if(this.onConsoleMessageReceived){
                for (const func of this.onConsoleMessageReceived){
                    func(event.data)
                }
            }
        }
        this.onConsoleMessageReceived = [];
        this.#ws = new WebSocket('ws://localhost:8000/consolelogs/45745457',);
        console.log(this.#ws)
        this.#ws.onopen = (event) => {
            this.#ws.send(JSON.stringify({event: "subscribe", data:"console"}));
        };
        this.#ws.onmessage = onWebsocketMessage;
    

          
    }

}