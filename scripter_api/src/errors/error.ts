import { Response } from "express";
import { ValidationError } from "express-validator";
import ErrorType from "./errorTypes";
import { InvalidArgumentError } from "./invalidArgumentsError";
import { NotFoundError } from "./notFoundError";

export function returnError(error: ValidationError, res: Response<any, Record<string, any>>) {

    const errorType: ErrorType = ErrorType[error.msg as keyof typeof ErrorType];

    if (!(error.value)) {
        InvalidArgumentError.return(res);
    }
    else if (errorType === ErrorType.NOT_FOUND) {
        NotFoundError.return(res);
    }
}

export default interface RestError extends Error {
    message: string
    statusCode: number
    return: (res: Response<any, Record<string, any>>) => void
}