import { Pool } from 'pg';
// FIX: Use ES module import syntax instead of 'require'.
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool, // Export pool for transactions
};
