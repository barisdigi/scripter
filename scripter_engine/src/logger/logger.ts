import winston, { format } from 'winston';
const { combine, timestamp, printf } = format;

export default class Logger {
    // tslint:disable-next-line
    #format = printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
    });
    #logger
    constructor() {
        this.#logger = winston.createLogger({
            level: 'info',
            format: combine(
                timestamp(),
                this.#format
            ),
            defaultMeta: { service: 'user-service' },
            transports: [
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
            ],
        });
        if (process.env.NODE_ENV !== 'production') {
            this.#logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }
    info(message: string){
        this.#logger.info(message);
    }
    debug(message: string){
        this.#logger.debug(message);
    }
    error(message: string) {
        this.#logger.error(message);
    }
}