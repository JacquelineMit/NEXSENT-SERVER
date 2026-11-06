let logger;
export class Logger {
  log(msg) {
    console.log("Log: ", msg);
    return this;
  }

  error(msg) {
    console.error("Error: ", msg);
    return this;
  }

  static new() {
    if (logger != undefined) {
      return logger;
    }
    logger = new Logger();
    return logger;
  }
}
