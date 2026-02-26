import "dotenv/config";
import { pool } from "./server/db";
import { sql } from "drizzle-orm";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Try to get a connection from the pool
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    
    console.log("✅ Database connection successful!");
    console.log("Current time from database:", result.rows[0]);
    
    await pool.end();
  } catch (error: any) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.error("PostgreSQL is not running or not accessible at localhost:5432");
      console.error("Make sure PostgreSQL service is running and listening on port 5432");
    } else if (error.message.includes("does not exist")) {
      console.error("Database 'medi_chart_ai' does not exist. Run: npm run db:push");
    } else if (error.message.includes("password authentication failed")) {
      console.error("Check your PostgreSQL password in .env file");
    }
  }
}

testDatabase();
