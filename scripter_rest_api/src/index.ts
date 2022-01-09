import express from 'express';
import MongoWrapper from './mongodb/mongodb';
import IAddScriptRequestObject from './req_types/addScript';
import { body, param ,CustomValidator, validationResult } from 'express-validator';
var bodyParser = require('body-parser')

// rest of the code remains same
const app = express();
const PORT = 8000;
const mongoClient = new MongoWrapper();
mongoClient.connect()
app.use(bodyParser.json())
const isValidUser: CustomValidator = value => {
    return mongoClient.getAllPlayerScripts().then(allUsers => {
        if (allUsers && allUsers?.find((user) => user.id === value)) {
            return Promise.reject('User Id in Use');
        }
    });
}

app.post('/users/:userId/script', param('userId').custom(isValidUser) ,body('script').notEmpty(),(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    mongoClient.addPlayerScript(String(req.params?.userId), req.body.script);
    return res.send('Added Script')
})

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});