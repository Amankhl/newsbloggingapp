// db.ts
import mysql, { Pool, PoolOptions } from 'mysql2/promise';

const poolOptions: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blogapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool: Pool = mysql.createPool(poolOptions);

export default pool;


export type Blog = {
  user_id: number;
  title: string;
  img: string;
  published_at: Date;
  likes: number;
  content: string;
  comments_count: number;
  category_id: number;
};

export type SigninUser = {
  name: string;
  email: string;
  password: string;
  username: string;
}

export type loginUser = {
  identifier: string;
  password: string;
}
