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

// Escucha el evento de actualización de la lista de jugadores en la sala
socket.on('player-list', (players) => {
  console.log('Actualización de lista de jugadores:', players);
  const playerList = document.querySelector('#player-list');
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
        socket.emit('game-started');
      });
  }

});

// Escucha el evento de inicio de partida
socket.on('game-started', () => {
  console.log('La partida ha empezado');
  window.location.href = '/juego.html';
});

// Si el jugador actual es el administrador, muestra el botón "Iniciar partida" y envía un evento al servidor cuando se hace clic
socket.on('admin-status', (status) => {
  isAdmin = status;
});

socket.on('game-ended', () => {
  console.log('La partida ha terminado');
  window.location.href = '/podio.html';
});