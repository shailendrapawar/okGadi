import { pool } from "../../configs/db/dbConnect.js";


export const  checkIfAdminExists=async()=>{
 const existing = await pool.query(`SELECT id FROM admin LIMIT 1`);
    if (existing.rows.length > 0) {
      return  true;
    }
    return false;
}

export const registerAdminService = async ({ first_name, last_name, email, password, mobile_number,created_by }) => {
  
  try {
    const result = await pool.query(
      `INSERT INTO admin (first_name, last_name, email, mobile_number, password,created_by)
       VALUES ($1, $2, $3, $4, $5,$6) RETURNING id,first_name, last_name, email`,
      [first_name, last_name, email, mobile_number, password,created_by||null]
    );

    // console.log(result.rows)
    return result.rows[0] || [];

  } catch (err) {
    console.log(err);
    return err
  }
}



export const checkUserExistsByEmailOrMobile = async ({ mobile_number, email }) => {

    const result = await pool.query(`
     SELECT id from  admin WHERE 
         email=$1 
          OR 
          mobile_number=$2;

     `, [email, mobile_number]);

    return result.rows;
}


export const findUserByEmailOrMobile = async ({ identifier }) => {
    const result = await pool.query(
      ` SELECT id,password,email,role,login_method,login_attempts,account_locked_until  from  admin
         WHERE 
         email=$1
         OR mobile_number=$1 LIMIT 1;
    `, [identifier])

    return result
}


export const updateLoginMethodService=async({email,login_method,googleId})=>{
  const result=await pool.query(`
    
    UPDATE ADMIN 
    SET login_method =$1, google_id=$2
    WHERE email=$3 RETURNING *
    `,[login_method,googleId,email])

    return result
}

export const updateLoginAttemptCountService=async(data)=>{
const{identifier_type,attempt_count,identifier_value}=data
  const result = await pool.query(
      `UPDATE admin 
       SET login_attempts = $1 
       WHERE ${identifier_type} = $2
       RETURNING id, login_attempts`,
      [attempt_count, identifier_value]
  );
  
  return result.rows[0];
}