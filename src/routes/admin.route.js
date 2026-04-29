import express from "express";
import adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to the admin dashboard!" });
});

router.post("/create-organization", adminController.createOrganization)

export default router;