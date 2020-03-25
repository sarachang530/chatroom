const express = require('express');

const PORT = process.env.PORT || 3000;
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'client')));

const botName = 'Bot';

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // 'welcome to chat is saved as message and sent to client
    socket.emit('message', formatMessage(botName, 'Welcome to Chat!'));

    // Broadcast when a user connects // to all clients except client thats connecting
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );
  });
  console.log('New WS Connection...');

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    console.log(msg);
    io.emit('message', formatMessage('USER', msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    // let everyone know
    io.emit('message', formatMessage(botName, 'A user has left the chat'));
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
