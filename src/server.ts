import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { initWebSocket } from "./websocket/index.js";

const server = http.createServer(app);

initWebSocket(server);

server.listen(ENV.APP_PORT, () => {
  console.log(`Server running on port ${ENV.APP_PORT} !!`);
});
