

const LOG_SERVER_URL = "http://localhost:5000/logs"; // поменяй на свой BACKEND URL

class Logger {
  info(message, data = null) {
    console.info("[INFO]", message, data || "");
    this.sendToServer("info", message, data);
  }

  warn(message, data = null) {
    console.warn("[WARN]", message, data || "");
    this.sendToServer("warn", message, data);
  }

  error(message, data = null) {
    console.error("[ERROR]", message, data || "");
    this.sendToServer("error", message, data);
  }

  
  async sendToServer(level, message, data) {
    try {
      await fetch(LOG_SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          message,
          data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("[LOGGER ERROR]", err);
    }
  }
}

const logger = new Logger();
export default logger;
