import { db, createPool } from "./src/db/index.js";
import fs from "fs";

async function run() {
  const pool = createPool();
  try {
    const sql = fs.readFileSync("migrations/0013_normal_anthem.sql", "utf-8");
    await pool.query(sql);
    console.log("Migration applied successfully!");
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
