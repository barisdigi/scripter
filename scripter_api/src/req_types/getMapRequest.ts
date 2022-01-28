import { Schema } from 'express-validator';
import ErrorType from '../errors/errorTypes';
import { v4 as uuid } from 'uuid';
import MongoWrapper from '../../../shared/mongodb/client';

const mongoClient = new MongoWrapper();
mongoClient.connect()

const GetMapRequestDefinition: Schema = {
    mapId: {
        in: ['params'],
        custom: {
            errorMessage: ErrorType[ErrorType.NOT_FOUND],
            options: async (value, { req, location, path }) => {
                return await mongoClient.mapExists(value).then(val => {
                    if (!val){
                        return Promise.reject();
                    }
                });
            },
        }

    }

}
export default GetMapRequestDefinition;