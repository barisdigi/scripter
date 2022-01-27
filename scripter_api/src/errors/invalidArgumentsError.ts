import RestError from "./error";

export const InvalidArgumentError: RestError = {
    message: "Invalid Arguments.",
    statusCode: 400,
    name: "InvalidArgumentError",
    return(res){
        res.status(this.statusCode).json({ error: this.message });
    }
}