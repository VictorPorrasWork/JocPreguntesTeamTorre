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
 
  
  // Muestra el nombre de usuario en la tabla de usuarios
  const tablaUsuarios = document.querySelector('#tablausuarios tbody');
  const row = tablaUsuarios.insertRow();
  const cell = row.insertCell();
  cell.textContent = playerName;
  
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
socket.on('game-go', (pregunta, opciones) => {
  // Mostrar el formulario de juego y ocultar el de inicio de sesión
  const loginForm = document.querySelector('#login');
  loginForm.style.display = 'none';
  const partidaForm = document.querySelector('#partida');
  partidaForm.style.display = 'block';

  // Mostrar la primera pregunta y opciones en el formulario de juego
  const preguntaInput = document.querySelector('#pregunta');
  preguntaInput.value = pregunta;
  const opcionesInputs = document.querySelectorAll('#opciones input');
  opcionesInputs.forEach((input, index) => {
    input.value = opciones[index];
  });
});



// Si el jugador actual es el administrador, muestra el botón "Iniciar partida" y envía un evento al servidor cuando se hace clic
socket.on('admin-status', (status) => {
  isAdmin = status;
});

socket.on('game-ended', () => {
  console.log('La partida ha terminado');
  window.location.href = '/podio.html';
});