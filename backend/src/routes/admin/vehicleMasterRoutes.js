import express from "express";
const vehicleMasterRouter=express.Router();

import checkRoleMiddleware from "../../middlewares/checkRoleMIddleware.js";
import VehicleMasterController from "../../controllers/admin/vehicleMasterController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import uploadIcon from "../../middlewares/imageUploader/iconsUploader.js";


vehicleMasterRouter.post("/add-vehicle",authMiddleware,checkRoleMiddleware(['admin']),uploadIcon,VehicleMasterController.addVehicle)
vehicleMasterRouter.post("/update-vehicle",authMiddleware,checkRoleMiddleware(['admin']),uploadIcon,VehicleMasterController.updateVehicle);

vehicleMasterRouter.get("/get-all-vehicles",authMiddleware,checkRoleMiddleware(['admin']),VehicleMasterController.getAllVehicles);
vehicleMasterRouter.get("/get-single-vehicle/:id",authMiddleware,checkRoleMiddleware(['admin']),VehicleMasterController.getSingleVehicle);


export default vehicleMasterRouter