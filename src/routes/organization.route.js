import express from "express";

const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.json({ message: "Welcome to the organization dashboard!" });
});

export default router;