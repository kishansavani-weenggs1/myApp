import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { ENV } from "../config/env.js";

const pool = mysql.createPool({
  host: ENV.DB.HOST,
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  database: ENV.DB.NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = drizzle(pool);
