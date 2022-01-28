import { Response } from 'express';

function returnResponse(res: Response<any, Record<string, any>>, message: string) {
    res.json({
        message
    })
}
export default returnResponse;