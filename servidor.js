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

  let tiempoRestanteId;

  socket.on('solicitopregunta', () => {
    let tiempoRestante = 30;
    intervalId = setInterval(() => {
        if (index < preguntas.length -1) {
          index++;
          const pregunta = preguntas[index].pregunta;
          const opciones = preguntas[index].opcions;
          const opcionBona = preguntas[index].opcioBona;
          io.emit('pregunta', pregunta, opciones);
          tiempoRestante = 30; // Reiniciar tiempo restante cada vez que se muestra una pregunta nueva
       
          // Cancelar intervalo anterior y crear uno nuevo para el tiempo restante
          clearInterval(tiempoRestanteId);
          tiempoRestanteId = setInterval(() => {
            tiempoRestante--;
            if (tiempoRestante <= 0) {
              clearInterval(tiempoRestanteId);
            } else {
              io.emit('tiempo-restante', tiempoRestante);
            }
          }, 1000);      
        } else {
          // Se han completado todas las preguntas
          //io.emit('resultadoFinal', puntuacion);
          io.emit('game-ended'); 
        clearInterval(intervalId);
        clearInterval(tiempoRestanteId); // Cancelar intervalo de tiempo restante al final del juego
        }
        // 60 segundos * 1000 milisegundos = 60000
      // 30 segundos  * milisegundos 1000 = 5000
    }, 30000);

    if (index < preguntas.length) {
    const pregunta = preguntas[index].pregunta;
    const opciones = preguntas[index].opcions;
    const opcionBona = preguntas[index].opcioBona;
  
    io.emit('pregunta', pregunta, opciones);
  }
  
  });
  
  socket.on('respuesta', (respuestaUsuario) => {
    const preguntaActual = preguntas[index];
    if (preguntaActual.opcioBona === respuestaUsuario) {
      puntuacion++;
      console.log('Respuesta correcta. Puntuación:', puntuacion);
      io.emit('puntuacion-actualizada', puntuacion);
    } else {
      console.log('Respuesta incorrecta. Puntuación:', puntuacion);
    }
    
    if (index < preguntas.length - 1) { // el -1 es para que no intente acceder a un elemento fuera del array
      index++;
      const pregunta = preguntas[index].pregunta;
      const opciones = preguntas[index].opcions;
      const opcionBona = preguntas[index].opcioBona;
      io.emit('pregunta', pregunta, opciones);

      // Cancelar intervalo anterior y crear uno nuevo para el tiempo restante
      clearInterval(tiempoRestanteId);
      let tiempoRestante = 30;
      tiempoRestanteId = setInterval(() => {
        tiempoRestante--;
        if (tiempoRestante <= 0) {
          clearInterval(tiempoRestanteId);
        } else {
          io.emit('tiempo-restante', tiempoRestante);
        }
      }, 1000);      
    } else {
      io.emit('resultadoFinal', puntuacion);
    }
  });
});

httpServer.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});