import app from '../app.js';
import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);

const io = new Server(server);

const incidents = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("create-incident",(clientData)=>{
    const data = JSON.parse(clientData);
    incidents[data.id] = {
        messages: [data.message]
    }; 
    socket.broadcast.emit("receive-incident",data)
  })

  socket.on("send-message",(data)=>{
    const {id,message} = JSON.parse(data);
    if(incidents[id]){
      incidents[id].messages.push(message);
      socket.broadcast.emit("receive-message",JSON.stringify(message));
    }
  })


  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

export default io;