
const express = require('express');
const http = require('http');
const path = require ('path');
const {Server} = require("socket.io");
const cors = require("cors");

require('dotenv').config();
// const { instrument } = require("@socket.io/admin-ui");

const connectDB = require('./db');

const Message = require('./models/Message');
const { send } = require('process');

const app = express();
const PORT = process.env.PORT || 5000;


connectDB();

app.use(cors({
  origin:"http://localhost:3000",
  methods: ["GET","POST"],
  credentials:true
}));



const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    methods:["GET","POST"]
  }
});

// instrument(io,{
  //   auth:false
  // })
  
  
const users = new Map();

const getUsersInRoom = (roomName) => {
  const usersInRoom = [];

  for (const [id,user] of users.entries()){
    if (user.room === roomName){
      usersInRoom.push({id,username:user.username});
    } 
  }
  return usersInRoom;
};



io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  socket.on('join',async ({username,room}) => {
    

    console.log(`User ${username} joined room ${room} with socket ID ${socket.id} .`);


    users.set(socket.id, {username,room});
    socket.join(room);

    try{
      const chatHistory = await Message.find({room:room})
        .sort({createdAt: -1})  //latest message first
        .limit(50);   //sirf last 50 messages
      socket.emit('chatHistory',chatHistory.reverse());  //Isse messages oldest to newest order m dikhengye
;
      console.log(`Found ${chatHistory.length} message for room "${room}"`);
      
    }catch(error){
      socket.emit('errorMessage','Unable to fetch chat history');
      console.error('Error fetching chat history:',error);
      
    }

    // console.log(`Current users in room "${room}":`,getUsersInRoom(room));


    console.log(`Socket ${socket.id} has successfully joined room ${room}`);
    console.log(`Current users:`,users);

    socket.emit('message',{
      user:'Admin',
      text : `Welcome to the ${room} room, ${username}!`
    });

    socket.broadcast.to(room).emit('message',{
      user:'Admin',
      text:`${username} has joined the chat!`,
    });  

    
    io.to(room).emit('roomData',{
      room:room, //the name of the room
      users: getUsersInRoom(room) //The list of users in the room,retrieved from our helper function.
    });
    
    console.log(`Sent updated user list for room \"${room}\" to all clients.`);
    
    
  });
  
  socket.on('sendMessage',async ({text}) => {
    // yha (message) ki jgh ({text}) change kiya h
    
    console.log(`Received raw message from ${socket.id}: "${text}"`);
    
    if (users.has(socket.id)){
      const user = users.get(socket.id);

      console.log(`Message from user "${user.username}" in room "${user.room}": "${text}"`);
      
      try{
        const newMessage = new Message({
          author:user.username,
          room:user.room,
          text:text,
          timestamp:new Date()
        });

        await newMessage.save();
        console.log('Message saved to database successfully.');

        io.to(user.room).emit('newMessage',{
          id: newMessage._id,
          text:newMessage.text,
          sender: {
            id: socket.id,
            username: user.username,
          },
          room:user.room,
          timestamp: newMessage.timestamp,
        });
        
      }catch(error){
           console.error('Error saving message to database: ',error);
           
      }

    }else{
      console.log(`Received message from an unknown user: ${socket.id}`);
    }
    
  });

  socket.on('typing',()=>{
    // console.log(`User ${socket.id} is typing...`);
    if (users.has(socket.id)){
      const user = users.get(socket.id);
      socket.broadcast.to(user.room).emit('userTyping',{
        username: user.username
      });
    }
  });

  socket.on('stopTyping',()=>{
    if (users.has(socket.id)){
      const user = users.get(socket.id);

      socket.broadcast.to(user.room).emit('userStoppedTyping',{
        username:user.username
      });
    }
  });


  socket.on('privateMessage', ({ recipientId,text }) => {
    const sender = users.get(socket.id);
    if (sender){
      // console.log('---Private Message Received---');
      // console.log(`From (sender): ${sender.username} (${socket.id})`);
      // console.log(`To (recipent): ${recipientId}`);
      // console.log(`Message Text: ${text}`);
      const messagePayload = {
        text:text,
        sender:{
          id:socket.id,
          username:sender.username,
        },
        recipient:{
          id:recipientId,
          username: users.get(recipientId)?.username || "Unknown"
        },
        timestamp:new Date().toISOString()
      };
      io.to(recipientId).emit('newPrivateMessage',messagePayload);
      socket.emit('newPrivateMessage',messagePayload);
      console.log(`Received private message from ${sender.username} to ${recipientId}`);
      io.to(recipientId).emit('message',{
        user:'Admin',
        text:`You received a private message from ${sender.username}`
      });
      
    }else{
      console.log(`Received private message from an unknown user: ${socket.id}`);
    }
  });
  
  socket.on('disconnect',()=>{
    
    if (users.has(socket.id)){
      const user = users.get(socket.id);
      
      console.log(`User ${user.username} from room ${user.room}`)
      
      
      socket.broadcast.to(user.room).emit('message',{
        user:'Admin',
        text:`${user.username} has left the chat.`
      });

      users.delete(socket.id);
      // console.log("Users map updated:", users);
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      });

      console.log(`Sent updated user list for room "${user.room}" after user disconnect.`);
      
    }else{
      console.log(`User disconnected: ${socket.id} (was not in a room).`);
    }

    
  });
});


const buildPath = path.join(__dirname, '..' , 'client' , 'build');

app.use(express.static(buildPath));


app.get("/" ,(req,res) => {
  res.sendFile(path.join(buildPath,"index.html"));
})


server.listen(PORT,()=>{
  console.log(`Server started at port ${PORT}`);
})


