const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
app.use(cors("*"));
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

let users = [];
const messages = {
  general:[],
  
};


io.on("connection", (socket) => {
  socket.on("join server", (username) => {
    const user = {
      username,
      id: socket.id,
    };
    users.push(user);
    io.emit("new user", users);
  });
  socket.on("join room", (roomName, cb) => {
    socket.join(roomName);
    cb(messages[roomName]);
  });
  
  socket.on("add room", (room) => {
      const result={...messages, room}
    io.emit("getNewRoom",result );
     console.log( "newwww" ,result)
  });

  socket.on("send message", ({ content, to, sender, chatName, isChannel }) => {
    if (isChannel) {
      const payload = {
        content,
        chatName,
        sender,
      };
      io.to(to).emit("backmessage", payload);
    } else {
      const payload = {
        content,
        chatName: sender,
        sender,
      };
      io.to(to).emit("backmessage", payload);
    }
    if (messages[chatName]) {
      messages[chatName].push({
        sender,
        content,
      });
    }
  });
  socket.on("disconnect", () => {
    users = users.filter((u) => u.id !== socket.id);
    io.emit("new user", users);
  });
});

server.listen(1337, () => console.log("server is listening on port1337"));
