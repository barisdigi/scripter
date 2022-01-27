import { Schema } from 'express-validator';

const AddScriptRequestDefinition: Schema = {
    script: {
        in: ['body'],
        exists: true,
        errorMessage: 'Could not find script in body.',
    }
}
export default AddScriptRequestDefinition;