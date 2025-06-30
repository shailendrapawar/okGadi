
import { pool } from "../../configs/db/dbConnect.js";


export const checkUnexpiredOtp = async (data) => {

    const { identifier_type, identifier_value, purpose, user_role, } = data;
    const now = new Date();

    const result = await pool.query(`
        SELECT * from otp_verifications
          WHERE
          identifier_type=$1
          AND identifier_value=$2
          AND purpose =$3
          AND user_role=$4
          AND expires_at> $5
          AND is_verified = false
          ORDER BY created_at DESC
          LIMIT 1
    `, [identifier_type, identifier_value, purpose, user_role, now]);

    if (result.rowCount > 0) {
        return true;
    }
    return false;
}



export const insertOtpService = async (data) => {

    const { identifier_type, identifier_value, user_role, purpose, otp_code, expires_at } = data;
    
    const result = await pool.query(`
        INSERT into otp_verifications
        (identifier_type,identifier_value,user_role,purpose,otp_code,expires_at)
        VALUES
        ($1,$2,$3,$4,$5,$6) RETURNING identifier_type,identifier_value,otp_code ;
        `, [identifier_type, identifier_value, user_role, purpose, otp_code, expires_at])

    return result
}


export const checkMatchingOtpService = async (data) => {

    const { identifier_type, identifier_value, user_role, purpose } = data
    // console.log(data)

    const now = new Date();
    const result = await pool.query(`
        SELECT * from otp_verifications 
        WHERE 
          identifier_type=$1

          AND identifier_value=$2

          AND user_role=$3
          AND purpose= $4
 
          and is_verified=false
           ORDER BY created_at DESC
           LIMIT 1
        `, [identifier_type, identifier_value, user_role, purpose])

    return result;
}

export const markOtpAsVerifiedService = async (data) => {
    const result = await pool.query(`
        UPDATE otp_verifications
        SET is_verified=TRUE
           WHERE id=$1 

        `, [data.otp_id,])
    // console.log(result.rowCount);
    return result;
}


export const increaseOtpAttemptCount = async (data) => {
    const { id } = data;
    const result = await pool.query(`
        UPDATE otp_verifications
        SET attempt_count= attempt_count+1
        WHERE id=$1
        `, [id])
    // console.log(result);
    return true;
}


export const isOtpVerifiedService = async (data) => {
    const { identifier_type, identifier_value, purpose, user_role } = data;
    const now = new Date();
    const result = await pool.query(
      `SELECT is_verified
         FROM otp_verifications

         WHERE identifier_type = $1
          AND identifier_value = $2
          AND user_role = $3
          AND purpose = $4
          AND is_verified = true
          AND expires_at > $5
         ORDER BY created_at DESC
         LIMIT 1`,
        [identifier_type, identifier_value, user_role, purpose, now]
    );
    // console.log(result.rowCount)
    return result.rowCount > 0;
}


export const changePasswordService = async (data) => {

    const { identifier_type, identifier_value, hashPassword } = data;

    let cloumn = "";
    if (identifier_type === "email") {
        cloumn = "email";
    } else if (identifier_type === "mobile") {
        cloumn = "mobile_number";
    } else {
        throw new Error("invalid identifier type")
    }

    const query = `UPDATE admin 
                     set password=$1
                     WHERE ${cloumn}=$2 RETURNING id`;

    const result = await pool.query(query, [hashPassword, identifier_value]);
    return result;

}