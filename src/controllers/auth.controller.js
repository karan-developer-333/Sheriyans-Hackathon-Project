import axios from "axios";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const githubAuth = (req, res) => {
    // Implement GitHub OAuth logic here
    res.send(`
        <a href="https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}" >Login with GitHub</a>
        `);
}

import qs from "querystring";

const githubcallback = async (req, res) => {
    try {
        const { code } = req.query;

        console.log("CODE:", code);

        const response = await axios.post(
            "https://github.com/login/oauth/access_token",
            qs.stringify({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
            }),
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        console.log("TOKEN RESPONSE:", response.data);

        res.json(response.data);

    } catch (error) {
        console.log("FULL ERROR:", error.response?.data || error.message);
        res.status(500).json(error.response?.data || "Internal error");
    }
};

const login = (req, res) => {
  const { username, password } = req.body;
}

const register = (req, res) => {
    //   const { username, password } = req.body;
 
}

export default {
    githubAuth,
    githubcallback,
    login,
    register
}