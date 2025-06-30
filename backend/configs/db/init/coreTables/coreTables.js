

const createCoreTables = async (pool) => {

  // 1:- document table========
  await pool.query(`
       CREATE TABLE IF NOT EXISTS documents (
         id SERIAL PRIMARY KEY,
         aadhar_front VARCHAR(255),
         aadhar_back VARCHAR(255),
         pan_photo VARCHAR(255),
         license_photo VARCHAR(255),
         gst_certificate VARCHAR(255),
         profile_photo VARCHAR(255),
         uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );
    `);


  // 2: otp verification table ============
  await pool.query(`
       CREATE TABLE IF NOT EXISTS otp_verifications (
       
          id SERIAL PRIMARY KEY,

          identifier_type TEXT CHECK (identifier_type IN ('mobile', 'email')) NOT NULL,
          identifier_value VARCHAR(150) NOT NULL,

          user_role TEXT CHECK (user_role IN ('admin', 'user', 'vehicle_owner')) NOT NULL DEFAULT 'user',

          otp_code VARCHAR(8) NOT NULL,
          purpose TEXT DEFAULT 'signup' CHECK (purpose IN ('signup', 'login', 'reset_password')),

          is_verified BOOLEAN DEFAULT FALSE,
          attempt_count INTEGER DEFAULT 0,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP
      );   
    `)


  // 3:- admin table =========

  await pool.query(`
      CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    mobile_number VARCHAR(15) UNIQUE,
    password VARCHAR(255), 

    google_id VARCHAR(100) DEFAULT NULL,
    login_method TEXT CHECK (login_method IN ('password', 'google','both')) DEFAULT 'password',
    role VARCHAR(50) DEFAULT 'admin',

    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    
    last_login TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (created_by) REFERENCES admin(id) ON DELETE SET NULL
    );
    `)

  console.log("core tables created")
}

export default createCoreTables;