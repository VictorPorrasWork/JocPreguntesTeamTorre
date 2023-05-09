const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);
const fs = require('fs');
const path = require('path');
const preguntas = require('./public/preguntas.json');

// Ruta para servir archivos estáticos
app.use(express.static(__dirname + '/public'));

// Ruta principal para servir el archivo juego.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/juego.html');
});

// Lista de jugadores en la sala
let players = [];

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

    // Envía el nombre de usuario al cliente recién conectado
    socket.emit('player-name', playerName);

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
        io.emit('saludo');
      });

      socket.on('solicitopregunta', () => {
        let index = 0;
        let puntuacion = 0;
      
        //hemos quitado el setInterval que el jugador vaya respondiendo
        //const intervalId = setInterval(() => {
          const pregunta = preguntas[index].pregunta;
          const opciones = preguntas[index].opcions;
          const opcionBona = preguntas[index].opcioBona;
         
          //llega pregunta opciones opcionBona
          //poner for
          io.emit('pregunta', pregunta, opciones);
          index++;
          if (index < preguntas.length) {
            console.log(preguntas.length);
            console.log(opciones);
           // clearInterval(intervalId);
            io.emit('resultadoFinal', puntuacion);
          }
        //}, 5000);
      

        socket.on('respuesta', (respuestaUsuario) => {
          const preguntaActual = preguntas[index - 1];
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
            io.emit('pregunta', pregunta, opciones);
          } else {
            io.emit('resultadoFinal', puntuacion);
          }
        });
        
      });
     
   });


// Inicia el servidor
httpServer.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});