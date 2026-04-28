import axios from "axios";
import qs from "querystring";
import {config} from "dotenv";

config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const githubAuth = (req, res) => {
    // Implement GitHub OAuth logic here
    res.send(`
        <a href="https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user">Login with GitHub</a>
        `);
}


const githubcallback = async (req, res) => {
    try {
        const { code } = req.query;

        const response = await axios.post(
            "https://github.com/login/oauth/access_token",
            qs.stringify({
                client_id:GITHUB_CLIENT_ID,
                client_secret:GITHUB_CLIENT_SECRET,
                code: code,
            }),
            {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

         const accessToken = await response.data.access_token;
            console.log("Access Token:", accessToken);
         const userRes = await axios.get("https://api.github.com/user", {
            headers: {
            Authorization: `Bearer ${accessToken}`
            }
         });
         console.log("User Response:", userRes.data);
         const user = await userRes.data;

         res.json(user);

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

export default {
    githubAuth,
    githubcallback,
    login,
    register
}