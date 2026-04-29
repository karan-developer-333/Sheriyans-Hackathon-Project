import express from "express";
import adminController from "../controllers/admin.controller.js";
import validateUser from "../middlewares/validateUser.middleware.js";
import validateAccessMiddleware from "../middlewares/validateAccess.middleware.js";

const router = express.Router();

router.get("/dashboard",validateUser,validateAccessMiddleware.validateAdmin, (req, res) => {
    res.json({ message: "Welcome to the admin dashboard!" });
});

router.post("/create-organization",validateUser,validateAccessMiddleware.validateAdmin, adminController.createOrganization)

export default router;