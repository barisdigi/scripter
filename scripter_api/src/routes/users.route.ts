import { body, CustomValidator, param, validationResult } from 'express-validator';
import { Response } from 'express';
import expressWs from 'express-ws';
import MongoWrapper from '../../../shared/mongodb/client';
import AddScriptRequestDefinition from '../req_types/addScriptRequest'
import { checkSchema } from 'express-validator';
import { Request } from 'express-validator/src/base';
import { returnError } from '../errors/error';
import UpdateScriptRequestDefinition from '../req_types/updateScriptRequest';

const useRoutes = (app: expressWs.Application, mongoClient: MongoWrapper) => {
    function returnResponse(res: Response<any, Record<string, any>>, message: string) {
        res.json({
            message
        })
    }

    const isValidUser: CustomValidator = value => {
        return mongoClient.playerExists(value).then(userExists => {
            if (!userExists) {
                return Promise.reject('User Id not in Use');
            }
        });
    }
    app.post('/users', checkSchema(AddScriptRequestDefinition), (req: Request, res: Response<any, Record<string, any>>) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnError(errors.array()[0], res);
        }

        mongoClient.addPlayerScript(req.body.script);
        return returnResponse(res, 'Added Script')
    })
    //param('userId').custom(async (value, meta) => !(isValidUser(value, meta))), 
    app.put('/users/:userId/script', checkSchema(UpdateScriptRequestDefinition), (req: Request, res: Response<any, Record<string, any>>) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnError(errors.array()[0], res);
        }
        mongoClient.editPlayerScript(String(req.params?.userId), req.body.script);
        return returnResponse(res, 'Edited Script')
    })

    app.get('/users/:userId/script', param('userId').custom(async (value, meta) => !(isValidUser(value, meta))), async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnError(errors.array()[0], res);
        }
        let result = (await mongoClient.getPlayerScript(String(req.params?.userId)))?.at(0);
        if (result) {
            return returnResponse(res, result.script);
        }

    })
}

export default useRoutes