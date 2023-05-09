const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const fs = require('fs');
const path = require('path');

// Ruta para servir archivos estáticos
app.use(express.static(__dirname + '/public'));

// Ruta para servir el archivo juego.html
app.get('/juego.html', (req, res) => {
  res.sendFile(__dirname + '/public/juego.html');
});

// Lista de jugadores en la sala
let players = [];

// Cargar las preguntas desde el archivo JSON
let preguntas = [];
const preguntasPath = path.join(__dirname, 'public', 'preguntas.json');
fs.readFile(preguntasPath, (err, data) => {
    if (err) throw err;
    preguntas = JSON.parse(data);
});

// Escucha las conexiones de los clientes
io.on('connection', (socket) => {
  console.log('Nuevo jugador conectado');

  // Escucha el evento de unirse a la sala
  socket.on('join-room', (playerName) => {
    // Crea un objeto para el jugador
    const player = { name: playerName, socketId: socket.id };
    // Agrega al jugador a la lista de jugadores en la sala
    players.push(player);

    // Envía un mensaje de confirmación al jugador
    socket.emit('room-joined', playerName);
    // Envía un mensaje a todos los jugadores en la sala con la lista actualizada de jugadores
    io.emit('player-list', players.map(player => player.name));
    console.log(`${playerName} se ha unido a la sala.`);
  });

      // Escucha el evento de desconexión de un jugador
      socket.on('disconnect', () => {
        console.log('Jugador desconectado');
        // Elimina al jugador de la lista de jugadores en la sala
        players = players.filter((player) => player.socketId !== socket.id);
    
        // Envía un mensaje a todos los jugadores en la sala con la lista actualizada de jugadores
        io.emit('player-list', players.map(player => player.name));
      });

  // Escucha el evento de inicio de la partida
  socket.on('game-started', () => {
      console.log('La partida ha empezado');
      io.emit('game-started');
      // Emitir la primera pregunta
      socket.emit('primeraPregunta', JSON.stringify(preguntas[0]));
      console.log(`Enviando la primera pregunta: ${JSON.stringify(preguntas[0])}`);
  });

});


// Inicia el servidor
httpServer.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
