import express from "express";
import userController from "../controllers/user.controller.js";
import validateUser from "../middlewares/validateUser.middleware.js";

const router = express.Router();

/*
    @route POST /user/join-organization
    @desc Join an organization using invite code
    @access Private
*/
router.post("/join-organization", validateUser, userController.joinOrganization);

export default router;