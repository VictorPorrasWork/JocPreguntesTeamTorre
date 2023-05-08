// Crea una instancia del cliente Socket.IO y se une a la sala
const socket = io('http://localhost:3000');
socket.on('connect', () => {
  console.log('Conectado al servidor');
});

let playerName;
let isAdmin = false;


document.querySelector('#login').addEventListener('submit', (event) => {
  event.preventDefault();
  const playerInput = document.querySelector('#player');
  playerName = playerInput.value.trim();
  socket.emit('join-room', playerName);
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

// Escucha el evento de inicio de partida
  socket.on('game-go', (playerName) => {
  window.location.href = '/juego.html';

});
  // Emitir el evento primeraPregunta dentro de la función game-started
  console.log("llega");

  // Escucha el evento de la primera pregunta
    socket.on('primeraPregunta', (pregunta) => {

      console.log(pregunta);
      // Verifica que la cadena JSON recibida sea válida
      let preguntaObj = null;
      try {
        preguntaObj = JSON.parse(pregunta);
      } catch (error) {
        console.error('Error al convertir la cadena JSON en un objeto JavaScript:', error);
        return;
      }
  
  // Actualiza la pregunta en la página
  document.getElementById('pregunta').value = preguntaObj.pregunta;
  
  // Actualizar las opciones en la vista
  document.getElementById('opcion-a').value = preguntaObj.opcions[0];
  document.getElementById('opcion-b').value = preguntaObj.opcions[1];
  document.getElementById('opcion-c').value = preguntaObj.opcions[2];
  document.getElementById('opcion-d').value = preguntaObj.opcions[3];
  
  // Ocultar el mensaje de respuesta en la vista
    const mensaje = document.querySelector('#mensaje');
    mensaje.textContent = '';
  });



// Si el jugador actual es el administrador, muestra el botón "Iniciar partida" y envía un evento al servidor cuando se hace clic
socket.on('admin-status', (status) => {
  isAdmin = status;
});

socket.on('game-ended', () => {
  console.log('La partida ha terminado');
  window.location.href = '/podio.html';
});