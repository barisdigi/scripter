import RestError from "./error";

export const NotFoundError: RestError = {
    message: "Resource your are looking for is not found.",
    statusCode: 404,
    name: "NotFoundError",
    return(res){
        res.status(this.statusCode).json({ error: this.message });
    }
}