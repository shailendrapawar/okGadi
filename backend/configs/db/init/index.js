import { pool } from "../dbConnect.js";
import createCoreTables from "./coreTables/coreTables.js";

const createAllTables=async()=>{

    await createCoreTables(pool);

}

export default createAllTables;