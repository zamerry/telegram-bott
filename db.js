import {Pool} from "pg";
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
    user: process.env.db_username,
    host: process.env.db_host,
    port: process.env.db_port,
    password: process.env.db_password,
    database: process.env.db_name
})

export default pool