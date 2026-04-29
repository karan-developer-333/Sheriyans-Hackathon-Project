
const validateAdmin = (req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(403).json({error: "Forbidden"});
    }
    next();
}

const validateOrganization = (req,res,next)=>{
    if(req.user.role !== "organization"){
        return res.status(403).json({error: "Forbidden"});
    }
    next();
}

export default {
    validateAdmin,
    validateOrganization
};