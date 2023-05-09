const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const preguntas = require('./public/preguntas.json');
const { count } = require('console');

// Ruta para servir archivos estáticos
app.use(express.static(__dirname + '/public'));

// Ruta principal para servir el archivo juego.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/juego.html');
});

// Lista de jugadores en la sala
let players = [];
let index = 0;
let puntuacion = 0;
let intervalId = null;

io.on('connection', (socket) => {
  console.log('Nuevo jugador conectado');

  socket.on('join-room', (playerName) => {
    players.push({ name: playerName, socketId: socket.id });
    socket.emit('room-joined', playerName);
    socket.emit('player-name', playerName);
    io.emit('player-list', players.map(player => player.name));
    console.log(`${playerName} se ha unido a la sala.`);
  });

  socket.on('disconnect', () => {
    console.log('Jugador desconectado');
    players = players.filter(player => player.socketId !== socket.id);
    io.emit('player-list', players.map(player => player.name));
  });

  socket.on('game-started', () => {
    console.log('La partida ha empezado');
    io.emit('saludo');
    index =0;
  });

  socket.on('solicitopregunta', () => {
    intervalId = setInterval(() => {
        if (index < preguntas.length) {
          index++;
          const pregunta = preguntas[index].pregunta;
          const opciones = preguntas[index].opcions;
          const opcionBona = preguntas[index].opcioBona;
          io.emit('pregunta', pregunta, opciones);
        } else {
          io.emit('resultadoFinal', puntuacion);
        }
    }, 5000);
  
    const pregunta = preguntas[index].pregunta;
    const opciones = preguntas[index].opcions;
    const opcionBona = preguntas[index].opcioBona;
  
    io.emit('pregunta', pregunta, opciones);
  });
  
  socket.on('respuesta', (respuestaUsuario) => {
    clearInterval(intervalId);
    const preguntaActual = preguntas[index];
    if (preguntaActual.opcioBona === respuestaUsuario) {
      puntuacion++;
      console.log('Respuesta correcta. Puntuación:', puntuacion);
    } else {
      console.log('Respuesta incorrecta. Puntuación:', puntuacion);
    }
    
    if (index < preguntas.length) {
      index++;
      const pregunta = preguntas[index].pregunta;
      const opciones = preguntas[index].opcions;
      const opcionBona = preguntas[index].opcioBona;
      io.emit('pregunta', pregunta, opciones);
    } else {
      io.emit('resultadoFinal', puntuacion);
    }
  });
});

httpServer.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
