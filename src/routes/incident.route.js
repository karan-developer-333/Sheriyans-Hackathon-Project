import express from "express";
import validateUser from "../middlewares/validateUser.middleware.js";
import incidentController from "../controllers/incident.controller.js";
import validateAccessMiddleware from "../middlewares/validateAccess.middleware.js";

const router = express.Router();

/*
    @route GET /incident/
    @desc Get all incidents for organizations the user belongs to
    @access Private
*/
router.get("/", validateUser, incidentController.getIncidents);

/*
    @route GET /incident/:id/messages
    @desc Get all messages for an incident
    @access Private
*/
router.get("/:id/messages", validateUser, incidentController.getMessages);

/*
    @route GET /incident/:id
    @desc Get single incident by ID
    @access Private
*/
router.get("/:id", validateUser, incidentController.getIncident);

/*
    @route POST /incident/
    @desc Create a new incident (org owner only)
    @access Private
    @roles organization (owner only)
*/
router.post("/", validateUser, validateAccessMiddleware.validateOrganization, incidentController.createIncident);

/*
    @route PUT /incident/:id
    @desc Update an incident (org owner only)
    @access Private
    @roles organization (owner only)
*/
router.put("/:id", validateUser, validateAccessMiddleware.validateOrganization, incidentController.updateIncident);

/*
    @route DELETE /incident/:id
    @desc Delete an incident (org owner only)
    @access Private
    @roles organization (owner only)
*/
router.delete("/:id", validateUser, validateAccessMiddleware.validateOrganization, incidentController.deleteIncident);

/*
    @route POST /incident/:id/ai-summarize
    @desc Generate AI summary for an incident
    @access Private
*/
router.post("/:id/ai-summarize", validateUser, incidentController.aiSummarize);

/*
    @route POST /incident/:id/ai-ask
    @desc Ask AI a question about an incident
    @access Private
*/
router.post("/:id/ai-ask", validateUser, incidentController.aiAsk);

export default router;
