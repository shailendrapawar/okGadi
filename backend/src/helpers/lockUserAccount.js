import { pool } from "../../configs/db/dbConnect.js";
import { userTableMapper } from "../../utils/userTableMapper.js";


const lockUserAccount = async (data) => {

    const { user_role, identifier_type,
        identifier_value,
        lock_minutes = 10 } = data

    const tableName = userTableMapper[user_role]

    if (!tableName) throw new Error(`unknow role : ${user_role}`);

    // set column name
      let column="";
    if(identifier_type==="email"){
        column="email"
    }else{
        column="mobile_number"
    }

    //1: check account current condition==
    const result = await pool.query(
        `SELECT account_locked_until FROM ${tableName} WHERE ${column} = $1`,
        [identifier_value]
    );
    if (result.rowCount === 0) throw new Error("User not found");

    const { account_locked_until } = result.rows[0];
    const now = new Date();

    //compare if not locked==
    if (account_locked_until && new Date(account_locked_until) > now) {
        return { alreadyLocked: true, until: account_locked_until };
    }


    //2: lock  account only if not locked
    const lockUntil = new Date(Date.now() + lock_minutes * 60 * 1000);

    const query = `
    UPDATE ${tableName}
    SET account_locked_until = $1,
    WHERE ${column} = $2
  `;

    await pool.query(query, [lockUntil, identifier_value]);

    return { alreadyLocked: false, until: lockUntil };

}

export default lockUserAccount;