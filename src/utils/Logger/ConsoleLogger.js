let logger = null;

export class ConsoleLogger {
    constructor() {}

    static async log(msg) {
        ConsoleLogger.new();
        console.log(`Log ${ConsoleLogger.getCurrentDate()}: ${msg}`)
    }

    static async error(msg) {
        ConsoleLogger.new();
        console.error(`Error ${ConsoleLogger.getCurrentDate()}: ${msg}`)
    }

    static getCurrentDate() {
        return new Date().toISOString();
    }

    static new() {
        if (logger) {
            return logger;
        }

        logger = new ConsoleLogger()
        return  logger;
    }
}