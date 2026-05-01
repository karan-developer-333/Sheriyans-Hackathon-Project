import express from "express";
import validateUser from "../middlewares/validateUser.middleware.js";
import { getEmployees, getMyOrg, getMyOwnOrganization, removeEmployee } from "../controllers/organization.controller.js";
import validateAccessMiddleware from "../middlewares/validateAccess.middleware.js";

const router = express.Router();

/*
    @route GET /organization/get-employees
    @desc Get all employees/members of organizations the user belongs to
    @access Private
    @roles organization, user, employee
*/
router.get("/get-employees", validateUser, getEmployees);

/*
    @route GET /organization/get-my-org
    @desc Get the current user's organization
    @access Private
*/
router.get("/get-my-org", validateUser, getMyOrg);

/*
    @route GET /organization/get-my-own-org
    @desc Get own organization data - ONLY for organization owners
    @access Private
    @roles organization (owner only)
*/
router.get("/get-my-own-org", validateUser,validateAccessMiddleware.validateOrganization, getMyOwnOrganization);

/*
    @route DELETE /organization/remove-employee/:userId
    @desc Remove an employee from organization (owner only)
    @access Private
    @roles organization (owner only)
*/
router.delete("/remove-employee/:userId", validateUser, validateAccessMiddleware.validateOrganization, removeEmployee);

/*
    @route GET /organization/dashboard
    @desc Welcome message for organization dashboard
    @access Private
*/
router.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to the organization dashboard!" });
});

export default router;