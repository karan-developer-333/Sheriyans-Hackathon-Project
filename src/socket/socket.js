import app from '../app.js';
import http from 'http';
import { Server } from 'socket.io';

import IncidentModel from '../models/incident.model.js';
import MessageModel from '../models/message.model.js';
import OrganizationModel from '../models/organization.model.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || ["https://f1rr36mb-5173.inc1.devtunnels.ms", "http://localhost:5173"],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] A user connected, socket id: ${socket.id}`);

  socket.on("join-org", (data) => {
    console.log('[Socket] Raw join-org data:', data);
    const parsed = JSON.parse(data);
    console.log('[Socket] Parsed join-org:', parsed);
    const { joinCode } = parsed;
    socket.join(`org:${joinCode}`);
    socket.joinCode = joinCode;
    console.log(`[Socket] User joined org room: org:${joinCode}`);
    socket.emit('joined-room', { joinCode });
  });

  socket.on("create-incident", async (clientData) => {
    try {
      console.log('[Socket] Raw create-incident data:', clientData);
      const data = JSON.parse(clientData);

      let organizationId = data.organizationId;

      if (!organizationId && data.joinCode) {
        console.log('[Socket] organizationId missing, looking up org by joinCode:', data.joinCode);
        const org = await OrganizationModel.findOne({ organizationJoinCode: data.joinCode });
        if (!org) {
          return socket.emit("error", "Organization not found for join code: " + data.joinCode);
        }
        organizationId = org._id;
        console.log('[Socket] Found organization:', org._id, org.organizationName);
      }

      if (!organizationId) {
        return socket.emit("error", "Either organizationId or joinCode is required");
      }

      const newIncident = await IncidentModel.create({
        title: data.title,
        description: data.description,
        organization: organizationId,
      });

      console.log('[Socket] Incident created:', newIncident._id);
      console.log('[Socket] Broadcasting to room: org:', data.joinCode);

      io.to(`org:${data.joinCode}`).emit("receive-incident", newIncident);
      console.log('[Socket] Broadcast complete');

    } catch (err) {
      console.error("[Socket] Error creating incident:", err);
      socket.emit("error", "Failed to create incident: " + err.message);
    }
  });

  socket.on("update-incident", async (clientData) => {
    try {
      const data = JSON.parse(clientData);
      console.log('[Socket] Updating incident:', data.incidentId, 'with joinCode:', data.joinCode);

      const updatedIncident = await IncidentModel.findByIdAndUpdate(
        data.incidentId,
        {
          title: data.title,
          description: data.description,
          status: data.status
        },
        { new: true }
      );

      if (updatedIncident) {
        console.log('[Socket] Incident updated, broadcasting to:', `org:${data.joinCode}`);
        io.to(`org:${data.joinCode}`).emit("receive-incident", updatedIncident);
      }
    } catch (err) {
      console.error("[Socket] Error updating incident:", err);
      socket.emit("error", "Failed to update incident");
    }
  });

  socket.on("send-message", async (clientData) => {
    try {
      const data = JSON.parse(clientData);
      console.log('[Socket] Message data received:', { incidentId: data.incidentId, userId: data.userId, senderName: data.senderName });

      if (!data.userId) {
        return socket.emit("error", "User ID is required");
      }

      const newMessage = await MessageModel.create({
        content: data.message,
        sender: data.userId,
        incident: data.incidentId
      });

      console.log('[Socket] Message saved to DB:', newMessage._id);

      io.to(`org:${data.joinCode}`).emit("receive-message", JSON.stringify({
        _id: newMessage._id,
        content: newMessage.content,
        sender: data.senderName || "Unknown",
        senderId: data.userId,
        tempId: data.tempId,
        incidentId: data.incidentId,
        createdAt: newMessage.createdAt
      }));
    } catch (error) {
      console.error("[Socket] Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected, socket id: ${socket.id}`);
  });
});

export {io, server};
