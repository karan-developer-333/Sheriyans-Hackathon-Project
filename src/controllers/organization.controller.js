import OrganizationModel from "../models/organization.model.js";
import Referer from "../models/referer.model.js";

// Get all employees/members of an organization
// Accessible by: organization owner, user, employee (any member of the org)
export const getEmployees = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find organizations the user is a member of via Referer collection
        const userReferers = await Referer.find({ referer: userId })
            .populate('organization');

        // Find organizations the user owns via OrganizationModel
        const ownedOrgs = await OrganizationModel.find({ owner: userId });

        if ((!userReferers || userReferers.length === 0) && ownedOrgs.length === 0) {
            return res.status(404).json({ error: "No organizations found" });
        }

        const allMembers = [];
        const organizations = [];
        const processedOrgIds = new Set();

        // Process organizations from Referer (user is a member)
        for (const ref of userReferers) {
            const org = ref.organization;
            if (!org || processedOrgIds.has(org._id.toString())) continue;
            processedOrgIds.add(org._id.toString());

            const orgReferers = await Referer.find({ organization: org._id })
                .populate('referer', 'username email role');

            organizations.push({
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                isOwner: org.owner.toString() === userId.toString()
            });

            for (const memberRef of orgReferers) {
                allMembers.push({
                    _id: memberRef.referer._id,
                    username: memberRef.referer.username,
                    email: memberRef.referer.email,
                    role: memberRef.referer.role,
                    organizationRole: 'member',
                    organizationId: org._id,
                    organizationName: org.organizationName
                });
            }
        }

        // Process owned organizations (user is the owner)
        for (const org of ownedOrgs) {
            if (processedOrgIds.has(org._id.toString())) continue;
            processedOrgIds.add(org._id.toString());

            const orgReferers = await Referer.find({ organization: org._id })
                .populate('referer', 'username email role');

            organizations.push({
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                isOwner: true
            });

            // Exclude owner from members list - only add Referer members
            for (const memberRef of orgReferers) {
                if (memberRef.referer._id.toString() === userId.toString()) continue;
                allMembers.push({
                    _id: memberRef.referer._id,
                    username: memberRef.referer.username,
                    email: memberRef.referer.email,
                    role: memberRef.referer.role,
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

        // First check if user owns an organization
        let org = await OrganizationModel.findOne({ owner: userId }).populate('owner', 'username email role');
        let isOwner = !!org;

        // If not an owner, find via Referer collection
        if (!org) {
            const userReferer = await Referer.findOne({ referer: userId })
                .populate('organization');

            if (!userReferer) {
                return res.status(404).json({ 
                    error: "You don't belong to any organization",
                    message: "You need to join or create an organization first"
                });
            }

            org = userReferer.organization;
            isOwner = false;
        }

        // Get all members of this organization via Referer
        const orgReferers = await Referer.find({ organization: org._id })
            .populate('referer', 'username email role');

        // Exclude owner from members list
        const members = orgReferers
            .filter(ref => ref.referer._id.toString() !== userId.toString())
            .map(ref => ({
                _id: ref.referer._id,
                username: ref.referer.username,
                email: ref.referer.email,
                role: ref.referer.role
            }));

        res.status(200).json({
            message: "Organization fetched successfully",
            organization: {
                _id: org._id,
                organizationName: org.organizationName,
                organizationJoinCode: org.organizationJoinCode,
                owner: isOwner ? {
                    _id: org.owner._id,
                    username: org.owner.username,
                    email: org.owner.email,
                    role: org.owner.role
                } : null,
                members,
                memberCount: members.length
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

        // Exclude owner from members list
        const members = orgReferers
            .filter(ref => ref.referer._id.toString() !== userId.toString())
            .map(ref => ({
                _id: ref.referer._id,
                username: ref.referer.username,
                email: ref.referer.email,
                role: ref.referer.role
            }));

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
                members,
                memberCount: members.length
            },
            accessLevel: 'owner',
            isOwner: true
        });

    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Remove an employee from the organization (owner only)
export const removeEmployee = async (req, res) => {
    try {
        const { userId } = req.params;

        const org = await OrganizationModel.findOne({ owner: req.user._id });
        if (!org) {
            return res.status(403).json({ error: "You do not own this organization" });
        }

        if (org.owner.toString() === userId) {
            return res.status(400).json({ error: "Cannot remove yourself" });
        }

        const removed = await Referer.findOneAndDelete({ referer: userId, organization: org._id });
        if (!removed) {
            return res.status(404).json({ error: "Employee not found in organization" });
        }

        res.status(200).json({ message: "Employee removed successfully" });
    } catch (error) {
        console.error("Error removing employee:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};