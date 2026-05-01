import express from "express";
import validateUser from "../middlewares/validateUser.middleware.js";
import { getEmployees, getMyOrg, getMyOwnOrganization } from "../controllers/organization.controller.js";
import validateAccessMiddleware from "../middlewares/validateAccess.middleware.js";

const router = express.Router();

// Get all employees/members of organizations the user belongs to
// Roles that can access: organization (owner), user, employee (any member)
router.get("/get-employees", validateUser, getEmployees);

// Get the current user's organization
// User hits this route, validator fetches user details → get user id → find their organization
router.get("/get-my-org", validateUser, getMyOrg);

// Get own organization data - ONLY for users with role "organization"
// Higher access - can only access their OWN organization (where they are owner)
router.get("/get-my-own-org", validateUser,validateAccessMiddleware.validateOrganization, getMyOwnOrganization);

// Dashboard route (existing)
router.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to the organization dashboard!" });
});

export default router;