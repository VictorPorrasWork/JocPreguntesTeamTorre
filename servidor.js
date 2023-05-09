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
let intervalId = null;

io.on('connection', (socket) => {
  console.log('Nuevo jugador conectado');

  socket.on('join-room', (playerName) => {
    players.push({ name: playerName, socketId: socket.id, score: 0 });
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
    // const pregunta = preguntas[index].pregunta;
    // const opciones = preguntas[index].opcions;
    // const opcionBona = preguntas[index].opcioBona;
    
    // io.emit('pregunta', pregunta, opciones);
  
    intervalId = setInterval(() => {
      if (index < preguntas.length - 1) {
        index++;
        const pregunta = preguntas[index].pregunta;
        const opciones = preguntas[index].opcions;
        const opcionBona = preguntas[index].opcioBona;
        io.emit('pregunta', pregunta, opciones);
      } else {
        io.emit('resultadoFinal', players.map(player => ({ name: player.name, score: player.score })));
        clearInterval(intervalId);
      }
    }, 3000);
  });
  
  
  socket.on('respuesta', (respuestaUsuario) => {
    const jugador = players.find(player => player.socketId === socket.id);
    const preguntaActual = preguntas[index];
    if (preguntaActual.opcioBona === respuestaUsuario) {
      jugador.score++;
      console.log(`${jugador.name} ha respondido correctamente. Puntuación: ${jugador.score}`);
      io.emit('puntuacion-actualizada', jugador.name, jugador.score);
    } else {
      console.log(`${jugador.name} ha respondido incorrectamente. Puntuación: ${jugador.score}`);
    }
    
    clearInterval(intervalId);
  });

  // socket.on('resultadoFinal', () => {
  //   // Ordena los jugadores por su puntuación en orden descendente
  //   const podium = players.sort((a, b) => b.score - a.score);
  //   // Muestra el podio en la consola del servidor
  //   console.log('--- PODIUM ---');
  //   for (let i = 0; i < podium.length; i++) {
  //     console.log(`${i + 1}. ${podium[i].name} - ${podium[i].score} puntos`);
  //   }
  //   // Emite el podio a todos los clientes
  //   io.emit('podio', podium);
  // });
});




httpServer.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
