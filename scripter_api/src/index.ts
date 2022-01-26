import MongoWrapper from '../../shared/mongodb/client';
import IAddScriptRequestObject from './req_types/addScript';
import { body, param ,CustomValidator, validationResult } from 'express-validator';
var bodyParser = require('body-parser')
import express from 'express';
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

const isNotValidUser: CustomValidator = value => {
    return mongoClient.playerExists(value).then(userExists => {
        if (userExists) {
            return Promise.reject('User Id in Use');
        }
    });
}
const isValidUser: CustomValidator = value => {
    return mongoClient.playerExists(value).then(userExists => {
        if (!userExists) {
            return Promise.reject('User Id not in Use');
        }
    });
}
app.post('/users', body('script').notEmpty(),(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    mongoClient.addPlayerScript(req.body.script);
    return res.send('Added Script')
})

app.put('/users/:userId/script', param('userId').custom(async (value, meta) => !(await isValidUser(value, meta))) ,body('script').notEmpty(),(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    mongoClient.editPlayerScript(String(req.params?.userId), req.body.script);
    return res.send('Edited Script')
})

app.get('/users/:userId/script', param('userId').custom(async (value, meta) => !(await isValidUser(value, meta))),async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    let result = (await mongoClient.getPlayerScript(String(req.params?.userId)))?.at(0);
    if(result){
        return res.send(result.script);
    }
    throw "script not found";
    
})

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});

app.ws('/consolelogs/:playerId', function(ws: any, req) {
    console.log(`console_logs/${req.params.playerId}`)
    ws.on('close', () => {
        redisClient.unsubscribe(`console_logs/${req.params.playerId}`)
    })
    redisClient.subscribe(`console_logs/${req.params.playerId}`,(message) => {
        ws.send(message)
    })
  });
