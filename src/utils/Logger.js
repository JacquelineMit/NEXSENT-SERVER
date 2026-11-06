let logger;
export class Logger {
  log(msg) {
    console.log("Log: ", msg);
  }

  error(msg) {
    console.error("Error: ", msg);
  }

  static new() {
    if (logger != undefined) {
      return logger;
    }
    logger = new Logger();
    return logger;
  }
}
