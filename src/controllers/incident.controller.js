import IncidentModel from "../models/incident.model.js";
import OrganizationModel from "../models/organization.model.js";
import Referer from "../models/referer.model.js";

// Get all incidents for organizations the user belongs to
export const getIncidents = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find organizations the user belongs to
        const userReferers = await Referer.find({ referer: userId });
        
        // Also check if user is an organization owner
        const ownedOrgs = await OrganizationModel.find({ owner: userId });
        
        const orgIds = userReferers.map(ref => ref.organization);
        ownedOrgs.forEach(org => {
            if (!orgIds.some(id => id.toString() === org._id.toString())) {
                orgIds.push(org._id);
            }
        });

        if (orgIds.length === 0) {
            return res.status(200).json({
                message: "No incidents found",
                incidents: []
            });
        }

        const incidents = await IncidentModel.find({
            organization: { $in: orgIds }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Incidents fetched successfully",
            incidents
        });

    } catch (error) {
        console.error("Error fetching incidents:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    getIncidents
};
