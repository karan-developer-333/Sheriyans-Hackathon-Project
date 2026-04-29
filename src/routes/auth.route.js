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

/*
    @route GET /auth/repos
    @desc Get all repositories for authenticated user
    @access Private
*/
router.get('/repos', authController.getUserRepos);

/*
    @route GET /auth/commits
    @desc Get commits for all or specific repository
    @access Private
*/
router.get('/commits', authController.getUserCommits);



export default router;