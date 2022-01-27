import MongoWrapper from '../../shared/mongodb/client';
import useAllRoutes from './routes/index';
var bodyParser = require('body-parser')
import express, { Response } from 'express';
import expressWs from 'express-ws';
import RedisWrapper from '../../shared/redis/client';

let appBase = express();
let wsInstance = expressWs(appBase);
let { app } = wsInstance;
const redisClient = new RedisWrapper()

const PORT = 8000;
const mongoClient = new MongoWrapper();
var cors = require('cors')
mongoClient.connect()
app.use(bodyParser.json())
app.use(cors())

useAllRoutes(app, mongoClient)


app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

app.ws('/consolelogs/:playerId', function (ws: any, req) {
    console.log(`console_logs/${req.params.playerId}`)
    ws.on('close', () => {
        redisClient.unsubscribe(`console_logs/${req.params.playerId}`)
    })
    redisClient.subscribe(`console_logs/${req.params.playerId}`, (message) => {
        ws.send(message)
    })
});
