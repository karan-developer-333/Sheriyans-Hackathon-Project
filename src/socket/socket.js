import app from '../app.js';
import http from 'http';
import { Server } from 'socket.io';

import IncidentModel from '../models/incident.model.js';
import MessageModel from '../models/message.model.js';

const server = http.createServer(app);
const io = new Server(server);



io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("create-incident",async (clientData)=>{

    try{
      const data = JSON.parse(clientData);

      const newIncident = await IncidentModel.create({
        title: data.title,
        description: data.description,
        organization: data.organizationId,
      });

      socket.broadcast.emit("receive-incident",newIncident);
    }
    catch(err){
      console.error("Error creating incident:", err);
      socket.emit("error", "Failed to create incident");
    }
  });

  socket.on("update-incident",async (clientData)=>{

    try{
      const data = JSON.parse(clientData);

      const updatedIncident = await IncidentModel.findByIdAndUpdate(
        data.incidentId,
        {
          title: data.title,
          description: data.description,
          status: data.status
        },
        { new: true }
      );

      if(updatedIncident){
        socket.broadcast.emit("receive-incident",updatedIncident);
      }
    }
    catch(err){
      console.error("Error updating incident:", err);
      socket.emit("error", "Failed to update incident");
    }
  });

  socket.on("send-message",async (clientData)=>{
    try {
      const data = JSON.parse(clientData);
      const incident = await IncidentModel.findById(data.incidentId);
      if(incident){
        const newMessage = await MessageModel.create({
          content: data.message,
          sender: data.userId,
          incident: data.incidentId
        });

        socket.broadcast.emit("receive-message",JSON.stringify(newMessage));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Failed to send message");
    }
  })


  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

export default io;