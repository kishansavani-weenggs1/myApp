import morgan from "morgan";

/**
 * HTTP request logger
 * Logs: method, URL, status, response time
 */
export const httpLogger = morgan("dev");
