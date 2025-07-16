
import { addVehicleSchema, updateVehicleSchema } from "../../../validations/vehicleMasterValidation.js";
import deleteIconfromServer from "../../helpers/deleteIcon.js";
import { checkVehicleExistsService, createVehicleService, getAllVehiclesService, getIconService, getSingleVehicleService, getTotalVehiclesNumber, updateVehicleService } from "../../models/admin/masterVehicleModel.js";
import { configDotenv } from "dotenv";
import path, { parse } from "path"
configDotenv();

class VehicleMasterController {

    static standardResponse = (res, status, message, data) => {
        return res.status(status).json({
            message,
            data: data
        })
    }

    // A: adding vehicle to system
    static addVehicle = async (req, res) => {
        try {
            const { value, error } = addVehicleSchema.validate(req.body)

            if (error) {
                return this.standardResponse(res, 400, ` Validation error : ${error.message}`, null)
            }
            if (!req.file) {
                return this.standardResponse(res, 400, `Icon file cannot be empty `, null)
            }
            if (value.category === "transport" && value.payload_min > value.payload_max) {
                return this.standardResponse(res, 400, "Minimum payload cannot be greater than maximum.")
            }


            const { vehicle_category, vehicle_type } = value;

            //1: check for existing vehicle
            const isExist = await checkVehicleExistsService({ vehicle_category, vehicle_type })

            if (isExist) {
                return this.standardResponse(res, 400, "Vehicle Type already exists in this category.", null);
            }

            //2: create vehicle
            const icon_url = req.file.filename;

            //3: check if vehicle is transport
            let isCreated;
            if (value.vehicle_category === "transport") {
                isCreated = await createVehicleService({ ...value, icon_url })
            } else {
                isCreated = await createVehicleService({ ...value, payload_min: null, payload_max: null, icon_url });
            }

            if (!isCreated) {
                return this.standardResponse(res, 400, "Error while creating vehicle", null);
            }

            return this.standardResponse(res, 200, "Vehicle Successfully created", null);
        } catch (err) {
            console.log("Error in creating vehicle in vehicle master", err);
            return this.standardResponse(res, 500, "Internal server error", null);
        }
    }


    // B:  update vehicle
    static updateVehicle = async (req, res) => {

        try {

            const { error, value } = updateVehicleSchema.validate(req.body)
            if (error) {
                return this.standardResponse(res, 400, `Validation error:- ${error.message}`, null);
            }

            // 1: find previous icon 
            const dbRes = await getIconService({ id: value.id })
            if (!dbRes.rowCount > 0) {
                return this.standardResponse(res, 400, "No existing vehicle with this", null);
            }


            // 2: check if any incoming icon image update
            let icon_url;
            if (req.file) {
                //if file incominng delete previous then save new
                deleteIconfromServer(dbRes.rows[0].icon_url)
                icon_url = req.file.filename
            } else {
                //if file not incoming resave the previous one
                icon_url = dbRes.rows[0].icon_url
            }

            // 3: update fields
            let isCreated;
            if (value.vehicle_category === "transport") {
                isCreated = await updateVehicleService({ ...value, icon_url })
            } else {
                isCreated = await updateVehicleService({ ...value, payload_min: null, payload_max: null, icon_url });
            }

            //4 : send response
            if (!isCreated.rowCount > 0) {
                return this.standardResponse(res, 400, "Some error in updating vehicle", null);
            }
            return this.standardResponse(res, 200, "Vehicle updated successfully", null);

        } catch (err) {
            console.log("Error in updating vehicle in vehicle master", err);
            return this.standardResponse(res, 500, "Internal server error", null);
        }
    }

    // C get all vehicles
    static getAllVehicles = async (req, res) => {


        const limit = parseInt(req.query.limit) || 1;
        const page = parseInt(req.query.page) || 10;
        const offset=(page-1)*limit;


        try {
            //1: get all vehicles according to page and limit
            const allVehicles = await getAllVehiclesService({limit,offset});

            //2: get total length of vehicles as well
            const countResult=await getTotalVehiclesNumber();
            const total=parseInt(countResult.rows[0].count);

            //3: calculate has more
             const hasMore = offset + limit < total;

            if (!allVehicles.rowCount > 0) {
                return this.standardResponse(res, 400, "Some erorr while retriving vehicles", null)
            }

            return this.standardResponse(res, 200, "Vehicles found", {vehicles:allVehicles.rows,total,hasMore});
        } catch (err) {
            console.log("Error in get all vehicles", err);
            return this.standardResponse(res, 500, "Internal server error", null);
        }
    }


    // D get single vehicle
    static getSingleVehicle = async (req, res) => {
        try {
            const { id } = req.params
            const vehicle = await getSingleVehicleService(id)
            if (!vehicle.rowCount > 0) {
                return this.standardResponse(res, 400, "Vehicle not found", null);
            }
            // const imgLink = path.join(`${process.cwd()}`, "uploads", "icons-uploads")
            return this.standardResponse(res, 200, "Vehicle found", vehicle.rows[0]);

        } catch (error) {
            console.log("Error in get single vehicles", err);
            return this.standardResponse(res, 500, "Internal server error", null);

        }
    }



}

export default VehicleMasterController;