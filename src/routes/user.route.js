import express from "express";
import userController from "../controllers/user.controller.js";
import validateUser from "../middlewares/validateUser.middleware.js";

const router = express.Router();

router.post("/join-organization", validateUser, userController.joinOrganization);

export default router;