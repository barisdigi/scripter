import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 65000 });

wss.on('listening', () => {
    console.log("listening")
})
console.log(wss.eventNames())