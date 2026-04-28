import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();


/*
    @route GET /auth/github
    @desc Redirect to GitHub for authentication
    @access Public
*/
router.get('/github', authController.githubAuth);

/*

*/
router.get('/github/callback', authController.githubcallback);

/*
    @route POST /auth/login
    @desc Login user and return JWT token
    @access Public
*/
router.post('/login', authController.login);

/*
    @route POST /auth/register
    @desc Register a new user
    @access Public
*/
router.post('/register', authController.register);



export default router;