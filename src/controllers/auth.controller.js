import githubService from "../services/github.service.js";

const githubAuth = (req, res) => {

    const url = githubService.getAuthUrl();

    res.send(`<a href="${url}">Login with GitHub</a>`);
}


const githubcallback = async (req, res) => {
    try {

        const { code } = req.query;
        const response = await githubService.getUser(code);
        res.json(response);

    } catch (error) {

        console.log("ERROR:", error.response?.data || error.message);
        res.status(500).json(error.response?.data);

    }
};

const login = (req, res) => {
  const { username, password } = req.body;
}

const register = (req, res) => {
    //   const { username, password } = req.body;
 
}

const getUserRepos = async (req, res) => {
    try {

        const accessToken = req.query.accessToken || req.headers.authorization?.split(' ')[1];

        if (!accessToken) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const data = await githubService.getUserRepos(accessToken);
        res.json(data);

    } catch (error) {

        console.log('ERROR:', error.response?.data || error.message);
        res.status(500).json(error.response?.data || error.message);

    }
};

const getUserCommits = async (req, res) => {
    try {
        const accessToken = req.query.accessToken || req.headers.authorization?.split(' ')[1];
        const { owner, repo } = req.query;

        const data = await githubService.getUserCommits(accessToken, owner, repo);
        res.json(data);

    } catch (error) {
        console.log('ERROR:', error.response?.data || error.message);
        res.status(500).json(error.response?.data || error.message);
    }
};

export default {
    githubAuth,
    githubcallback,
    login,
    register,
    getUserRepos,
    getUserCommits
}