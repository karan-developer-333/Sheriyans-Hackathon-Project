import OrganizationModel from "../models/organization.model.js"
import RefererModel from "../models/referer.model.js";

const joinOrganization = async (req, res) => {
    try {
        
        const { joinCode } = req.body;
        const userId = req.user.id;

        if (!joinCode) {
            return res.status(400).json({ error: "Join code is required" });
        }
    
        const organization = await OrganizationModel.findOne({ organizationJoinCode: joinCode }); 
        
        if (!organization) {
                return res.status(404).json({ error: "Join code is invalid" });
        }

        const existingReferer = await RefererModel.findOne({ organization: organization._id, referer: userId });

        if (existingReferer) {
            return res.status(400).json({ error: "User is already a member of this organization" });
        }

        const referer = await RefererModel.create({
                organization: organization._id,
                referer: userId,
        });

        return res.status(200).json({ message: "Successfully joined organization", referer });
    } catch (error) {
        console.error("Error joining organization:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default {
    joinOrganization,
}