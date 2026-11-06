import { ConsoleLogger } from "./ConsoleLogger.js";

let logger = null;

export class Logger {
    static async log(msg) {
        logger.log(msg);
    }

    static async error(msg) {
        logger.error(msg);
    }

    static setConsoleLogger() {
        logger = ConsoleLogger;
    }
}