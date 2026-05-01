import express from "express";
import validateUser from "../middlewares/validateUser.middleware.js";
import incidentController from "../controllers/incident.controller.js";

const router = express.Router();

// Get all incidents for organizations the user belongs to
router.get("/", validateUser, incidentController.getIncidents);

export default router;
