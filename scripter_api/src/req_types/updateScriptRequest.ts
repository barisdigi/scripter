import { Schema } from 'express-validator';
import ErrorType from '../errors/errorTypes';
import { v4 as uuid } from 'uuid';
import MongoWrapper from '../../../shared/mongodb/client';

const mongoClient = new MongoWrapper();
mongoClient.connect()

const UpdateScriptRequestDefinition: Schema = {
    script: {
        in: ['body'],
        exists: true,
        errorMessage: 'Could not find script in body.',
    },
    userId: {
        in: ['params'],
        custom: {
            errorMessage: ErrorType[ErrorType.NOT_FOUND],
            options: async (value, { req, location, path }) => {
                return await mongoClient.playerExists(value).then(val => {
                    if (!val){
                        return Promise.reject();
                    }
                });
            },
        }

    }

}
export default UpdateScriptRequestDefinition;