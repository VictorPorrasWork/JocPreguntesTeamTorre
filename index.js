//Servidor
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const preguntas = require('./preguntas.json');

//console.log(preguntas);

const app = express();
const httpServer = createServer(app);

app.get('/preguntas.json', (req, res) => {
  res.sendFile(__dirname + '/preguntas.json');
});

app.use(express.static("public"));

const io = new Server(httpServer, {});

const http = require('http');
const socketIO = require('socket.io');


const server = http.createServer(app);


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


const players = [];

io.on('connection', (socket) => {
  console.log('Usuario conectado: ' + socket.id);

  socket.on('join-game', (username) => {
    console.log('El usuario ' + username + ' ha entrado en la sala.');
    players.push({ id: socket.id, username });
    socket.emit('joined-game');
    io.emit('player-list', players);

    if (players.length >= 2) {
      const primeraPregunta = preguntas[0]; // se obtiene la primera pregunta
      io.emit('start-game', primeraPregunta); // se envía la primera pregunta a todos los usuarios
    }
  });


 socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    const index = players.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      const username = players[index].username;
      players.splice(index, 1);
      io.emit('player-list', players);
      io.emit('player-disconnected', username);
    }
  });
});



httpServer.listen(3000, ()=>
    console.log(`Server listening at http://localhost:3000`)
);

