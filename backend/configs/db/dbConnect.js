import { Pool } from "pg"
import { configDotenv } from "dotenv"
configDotenv();


    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })

const connectDb = async () => {
    try {
        await pool.connect()
        console.log("DB connnected: OKgadi")

        return pool
    } catch (err) {
        console.log(err)
        console.log("error in db connection")
        process.exit(1)
    }
}
export {pool,connectDb};



