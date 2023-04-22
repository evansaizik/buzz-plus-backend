const dotenv = require('dotenv').config({ path: './config.env' });
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
app.use(cors());

const PORT = process.env.PORT || 80;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.emit('me', socket.id);

  // messaging
  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(data, socket.id)
    console.log(`User with ID: ${socket.id} joined room: ${data}`);

    // testing ////////////
    socket.on('call_user', ({ userToCall, signalData, from, name }) => {
      console.log('calling');
      io.broadcast.emit('call_user', { signal: signalData, data, name });
    });
    socket.on('answer_call', (data) => {
      io.broadcast.emit('call_accepted', data.signal);
    });
    ///////////////////
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  // video chat

  // socket.on('call_user', ({userToCall, signalData, from, name}) => {
  //   console.log('calling')
  //   io.to(userToCall).emit('call_user', {signal: signalData, from, name})
  // })

  // socket.on('answer_call', (data) => {
  //   io.to(data.to).emit('call_accepted', data.signal)
  // })

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
    socket.broadcast.emit('call_ended')
  });
});

app.get('', (req, res) => res.send('<p>SERVER IS UP AND RUNNING</p>'));

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
