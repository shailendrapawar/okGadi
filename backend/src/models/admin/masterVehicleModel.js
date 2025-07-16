import { pool } from "../../../configs/db/dbConnect.js";


//1:Service for checking existing vehicle
export const checkVehicleExistsService = async ({ vehicle_type, vehicle_category }) => {
    const query = ` SELECT id from vehicle_master
                        WHERE vehicle_category=$1
                        AND vehicle_type=$2
    `;

    const res = await pool.query(query, [vehicle_category, vehicle_type]);
    return res.rowCount > 0;
}

//2:Service  for creating a vehicle
export const createVehicleService = async (data) => {

        const { icon_url, vehicle_category, vehicle_type, body_type, range_km, payload_min = null, payload_max = null } = data;

        const query = ` INSERT into vehicle_master 
                   (icon_url,vehicle_category,vehicle_type,body_type,range_km,payload_min,payload_max)
                   VALUES 
                   ($1,$2,$3,$4,$5,$6,$7)
                   RETURNING id
                   `
        const res = await pool.query(query, [icon_url, vehicle_category, vehicle_type, body_type, range_km, payload_min, payload_max])
        return res;
}

// 3: get exisitng icon url
export const getIconService=async({id})=>{
    const query =`
    SELECT icon_url from vehicle_master
    WHERE id=$1
    `
    const res=await pool.query(query,[id]);
    return res;
}

//4: update vehicle service 
export const updateVehicleService=async(data)=>{
    const{icon_url,vehicle_category,vehicle_type,body_type,range_km,payload_min=null,payload_max=null,id}=data;
    const now=new Date;
    const query=` UPDATE vehicle_master
                    SET
                    icon_url=$1,
                    vehicle_category=$2,
                    vehicle_type=$3,
                    body_type=$4,
                    range_km=$5,
                    payload_min= $6,
                    payload_max= $7,    
                    updated_at= $8        
                    WHERE id=$9    
                    RETURNING id
    `;

    const res=await pool.query(query,[icon_url,vehicle_category,vehicle_type,body_type,range_km,payload_min,payload_max,now,id]);
    return res
}


//5: get all vehicles service
export const getAllVehiclesService=async()=>{
    const query=` SELECT * from vehicle_master`
    const res=await pool.query(query);
    return res;
}

//6 get single vehicle
export const getSingleVehicleService=async(id)=>{

    const query=`SELECT * from vehicle_master
                       WHERE id=$1`;
    const res=await pool.query(query,[id]);

    return res
}