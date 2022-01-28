import { body, CustomValidator, param, validationResult } from 'express-validator';
import { Response } from 'express';
import returnResponse from './returnResponse';
import expressWs from 'express-ws';
import MongoWrapper from '../../../shared/mongodb/client';
import AddScriptRequestDefinition from '../req_types/addScriptRequest'
import { checkSchema } from 'express-validator';
import { Request } from 'express-validator/src/base';
import { returnError } from '../errors/error';
import GetMapRequestDefinition from '../req_types/getMapRequest';

const useRoutes = (app: expressWs.Application, mongoClient: MongoWrapper) => {
    app.get('/maps/:mapId',checkSchema(GetMapRequestDefinition) , async (req: Request, res: Response<any, Record<string, any>>) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return returnError(errors.array()[0], res);
        }
        let mapData = (await mongoClient.getMap(req.params.mapId));
        let playersInMap = (await mongoClient.getUsersInMap(req.params.mapId));
        let result = {
            map: mapData,
            players: playersInMap
        }
        if (result) {
            return res.json(result);
        }

    })
}

export default useRoutes