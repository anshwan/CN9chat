  const express = require('express');
  const http = require('http');
  const { join } = require('path');
  const { Server } = require('socket.io');

  const app = express();
  const server = http.createServer(app); // Express 애플리케이션으로 서버 생성
  const io = new Server(server);
  let users = [];


  app.use(express.static(__dirname));

  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  io.on('connection', (socket) => {
    socket.on('join', (nickname) => { 
      // 닉네임 중복 체크
      if (users.includes(nickname)) {
        socket.emit('nicknameError', 'This nickname is already taken.');
      } else {
        socket.nickname = nickname;
        users.push(nickname);
        io.emit('userJoined', { nickname, users });
        console.log(`${socket.nickname} connected!`);
      }
    });

    socket.on('message', ({ nickname, message }) => {
      io.emit('message', { nickname, message });
      console.log(`msg by ${nickname} : ${message}`);
    });

    socket.on('disconnect', () => {
      if (socket.nickname) {
        users = users.filter(user => user !== socket.nickname);
        io.emit('userLeft', { nickname: socket.nickname, users });
        console.log(`${socket.nickname} disconnected!`);
      }
    });
  });

  server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
  });
