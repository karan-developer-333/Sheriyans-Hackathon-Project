import OrganizationModel from "../models/organization.model.js";
import Referer from "../models/referer.model.js";

// Get all employees/members of an organization
// Accessible by: organization owner, user, employee (any member of the org)
export const getEmployees = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all organizations the user is associated with via Referer collection
        const userReferers = await Referer.find({ referer: userId })
            .populate('organization');

        if (!userReferers || userReferers.length === 0) {
            return res.status(404).json({ error: "No organizations found" });
        }

        // Collect all members from all organizations the user belongs to
        const allMembers = [];
        const organizations = [];

        for (const ref of userReferers) {
            const org = ref.organization;
            
            // Get all referers for this organization to find members
            const orgReferers = await Referer.find({ organization: org._id })
                .populate('referer', 'username email role');

            organizations.push({
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                isOwner: org.owner.toString() === userId.toString()
            });

            // Add owner as a member
            const owner = await OrganizationModel.findById(org._id)
                .populate('owner', 'username email role');
            
            if (owner) {
                allMembers.push({
                    ...owner.owner.toObject(),
                    organizationRole: 'owner',
                    organizationId: org._id,
                    organizationName: org.organizationName
                });
            }

            // Add all referers as members
            for (const memberRef of orgReferers) {
                allMembers.push({
                    ...memberRef.referer.toObject(),
                    organizationRole: 'member',
                    organizationId: org._id,
                    organizationName: org.organizationName
                });
            }
        }

        res.status(200).json({ 
            message: "Employees fetched successfully",
            count: allMembers.length,
            members: allMembers,
            organizations
        });

    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get the organization that the current user belongs to
// The validator middleware already fetched user details, so we use req.user.id
export const getMyOrg = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find user's organization via Referer collection
        const userReferer = await Referer.findOne({ referer: userId })
            .populate('organization');

        if (!userReferer) {
            return res.status(404).json({ 
                error: "You don't belong to any organization",
                message: "You need to join or create an organization first"
            });
        }

        const org = userReferer.organization;

        // Get all members of this organization via Referer
        const orgReferers = await Referer.find({ organization: org._id })
            .populate('referer', 'username email role');

        // Get owner details
        const organizationWithOwner = await OrganizationModel.findById(org._id)
            .populate('owner', 'username email role');

        // Determine the user's role in the organization
        const isOwner = organizationWithOwner.owner._id.toString() === userId.toString();

        res.status(200).json({
            message: "Organization fetched successfully",
            organization: {
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                owner: {
                    _id: organizationWithOwner.owner._id,
                    username: organizationWithOwner.owner.username,
                    email: organizationWithOwner.owner.email,
                    role: organizationWithOwner.owner.role
                },
                members: orgReferers.map(ref => ({
                    _id: ref.referer._id,
                    username: ref.referer.username,
                    email: ref.referer.email,
                    role: ref.referer.role
                })),
                memberCount: orgReferers.length
            },
            userRole: isOwner ? 'owner' : 'member'
        });

    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get own organization data - ONLY for users with role "organization"
// Higher access - can only access their OWN organization (not any org)
export const getMyOwnOrganization = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Only users with role "organization" can access this route
        if (userRole !== 'organization') {
            return res.status(403).json({ 
                error: "Access denied",
                message: "This route is only available for organization users"
            });
        }

        // Find the organization where this user is the owner
        const organization = await OrganizationModel.findOne({ owner: userId })
            .populate('owner', 'username email role');

        if (!organization) {
            return res.status(404).json({ 
                error: "Organization not found",
                message: "You haven't created any organization yet"
            });
        }

        // Get all members of this organization via Referer
        const orgReferers = await Referer.find({ organization: organization._id })
            .populate('referer', 'username email role');

        res.status(200).json({
            message: "Organization data fetched successfully",
            organization: {
                _id: organization._id,
                organizationName: organization.organizationName,
                organizationJoinCode: organization.organizationJoinCode,
                owner: {
                    _id: organization.owner._id,
                    username: organization.owner.username,
                    email: organization.owner.email,
                    role: organization.owner.role
                },
                members: orgReferers.map(ref => ({
                    _id: ref.referer._id,
                    username: ref.referer.username,
                    email: ref.referer.email,
                    role: ref.referer.role
                })),
                memberCount: orgReferers.length
            },
            accessLevel: 'owner',
            isOwner: true
        });

    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};