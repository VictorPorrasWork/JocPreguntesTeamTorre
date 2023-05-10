// Crea una instancia del cliente Socket.IO y se une a la sala
const socket = io('http://localhost:3000');

//Conexion al servidor
socket.on('connect', () => {
  console.log('Conectado al servidor');
});

let playerName;
let isAdmin = false;

// Ocultar lista de usuarios al inicio
const listaUsuarios = document.querySelector('#tablausuarios');
listaUsuarios.style.display = 'none';

document.querySelector('#login').addEventListener('submit', (event) => {
  event.preventDefault();
  const playerInput = document.querySelector('#player');
  playerName = playerInput.value.trim();
  socket.emit('join-room', playerName);
 
  
  // Muestra el nombre de usuario en la tabla de usuarios
  const tablaUsuarios = document.querySelector('#user-list');
  tablaUsuarios.textContent = playerName;
  
});

const countdownEl = document.getElementById('countdown');
socket.on('countdown', (countdown) => {
  countdownEl.textContent = countdown;
});


  // Escucha el evento de confirmación de unirse a la sala
  socket.on('room-joined', (name) => {
  console.log(`Te has unido a la sala, ${name}!`);
  const gameMessage = document.querySelector('#game-message');
  gameMessage.textContent = `Te has unido a la sala, ${name}! Esperando a otros jugadores...`;
  });

// Escucha el evento para recibir el nombre del jugador desde el servidor
socket.on('player-name', (name) => {
  playerName = name;
  const playerNameInput = document.querySelector('#playerName');
  if (playerNameInput) {
    playerNameInput.value = playerName;
    document.getElementById('playerName').value = playerName; // Agregar esta línea
  }
});

// Escucha el evento de actualización de la lista de jugadores en la sala
socket.on('player-list', (players) => {
  console.log('Actualización de lista de jugadores:', players);
  const playerList = document.querySelector('#player-list');
  if (playerList) {
    playerList.innerHTML = '';
    players.forEach((player, index) => {
      const li = document.createElement('li');
      li.textContent = player;
      playerList.appendChild(li);

    // Si el jugador actual es el administrador, establece la variable isAdmin a true
    if (player === 'administrador' && playerName === 'administrador') {
      isAdmin = true;
      socket.emit('set-admin');
    }
  });

  // Si el jugador actual es el administrador, muestra el botón "Iniciar partida" si hay suficientes jugadores en la sala
  if (isAdmin && players.length >= 2) {
    const startButton = document.querySelector('#start-button');
    startButton.style.display = 'block';
    
        // Evento click en el botón "Iniciar partida"
        startButton.addEventListener('click', () => {
          socket.emit('game-started', playerName);
        });
      }
    }
  });

//Mostramos el menu sin que aplique el temporizador
socket.on('saludo', () => {
  console.log("muestro el menú y ahora correra el tiempo ")

  // Ocultar el podio al inicio
  const podioForm = document.querySelector('#podio');
  podioForm.style.display = 'none';

  // Mostrar el formulario de juego y ocultar el de inicio de sesión
  const loginForm = document.querySelector('#login');
  loginForm.style.display = 'none';
  const partidaForm = document.querySelector('#partida');
  partidaForm.style.display = 'block';
  const UsuariosForm = document.querySelector('#tablausuarios');
  UsuariosForm.style.display = 'block';
  socket.emit('solicitopregunta');

});

// Recibimos la pregunta del servidor y la mostramos en el formulario
socket.on('pregunta', (pregunta, opciones) => {
  console.log(opciones);
  const preguntaElem = document.querySelector('#pregunta');
  preguntaElem.value = pregunta;
  const opcionesElems = document.querySelectorAll('#opciones button');
  for (let i = 0; i < opcionesElems.length; i++) {
    opcionesElems[i].textContent = opciones[i];
  }
});

const opcionesElems = document.querySelectorAll('#opciones button');
opcionesElems.forEach((opcionBtn) => {
  opcionBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Evitar recarga de la página
    const respuesta = opcionBtn.textContent;
    socket.emit('respuesta', respuesta);
  });
});

// Mostrar el resultado de la pregunta
socket.on('resultado', (resultado, respuestaCorrecta) => {
  const resultadoElem = document.querySelector('#resultado');
  if (resultado) {
    resultadoElem.value = '¡Correcto!';
  } else {
    resultadoElem.value = 'Incorrecto. La respuesta correcta es: ' + respuestaCorrecta;
  }
});

socket.on('puntuacion-actualizada', (puntuacion) => {
  const puntosPlayer = document.querySelector('#puntosPlayer');
  puntosPlayer.textContent = puntuacion;
});

socket.on('tiempo-restante', (tiempoRestante) => {
  document.getElementById('tiempo').textContent = tiempoRestante;
});

// Mostrar el resultado final del juego
socket.on('resultadoFinal', (puntuacion) => {
  document.getElementById('resultado-final').textContent = puntuacion;
});

// Mostrar el mensaje de error
socket.on('error', (mensaje) => {
  alert(mensaje);
});

// Si el jugador actual es el administrador, muestra el botón "Iniciar partida" y envía un evento al servidor cuando se hace clic
socket.on('admin-status', (status) => {
  isAdmin = status;
});

socket.on('game-ended', () => {
  console.log('La partida ha terminado');

  // Ocultar el formulario de juego y mostrar el de podio al terminar el juego
  const partidaForm = document.querySelector('#partida');
  partidaForm.style.display = 'none';
 
  const podioForm = document.querySelector('#podio');
  podioForm.style.display = 'block';

// Obtener los elementos de la lista de jugadores y concatenar sus nombres separados por comas
const playersList = document.querySelectorAll('#player-list li');
const playerNames = Array.from(playersList).map(player => player.textContent).join('<br>');

// Actualizar el contenido del elemento #player-list-update con los nombres de los jugadores
const playerListUpdateElem = document.querySelector('#player-list-update');
playerListUpdateElem.innerHTML = playerNames;

//Reiniciar partida
const reiniciarPartidaBtn = document.querySelector('#reiniciar');

    reiniciarPartidaBtn.addEventListener('click', () => {
      socket.emit('game-started');
    });


});