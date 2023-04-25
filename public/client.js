const socket = io();

const joinGameForm = document.getElementById('join-game-form');
const usernameInput = document.getElementById('username-input');

const preguntaInput = document.getElementById('pregunta');
const opcionAButton = document.getElementById('opcion-a');
const opcionBButton = document.getElementById('opcion-b');
const opcionCButton = document.getElementById('opcion-c');
const opcionDButton = document.getElementById('opcion-d');

joinGameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    socket.emit('join-game', username);
    joinGameForm.style.display = 'none';
  }
});

socket.on('joined-game', () => {
  const gameMessage = document.getElementById('game-message');
  gameMessage.textContent = 'Usted está en partida';
});

socket.on('player-list', (players) => {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  players.forEach((player) => {
    const li = document.createElement('li');
    li.textContent = player.username;
    playerList.appendChild(li);
  });
});

function cargarPrimeraPregunta() {
  fetch('/../preguntas.json')
    .then(response => response.json())
    .then(preguntas => {
      const primeraPregunta = preguntas[0];
      preguntaInput.value = primeraPregunta.pregunta;
      opcionAButton.textContent = primeraPregunta.opciones.A;
      opcionBButton.textContent = primeraPregunta.opciones.B;
      opcionCButton.textContent = primeraPregunta.opciones.C;
      opcionDButton.textContent = primeraPregunta.opciones.D;
    })
    .catch(error => {
      console.error('Error al cargar la primera pregunta:', error);
    });
}

socket.on('connect', () => {
  cargarPrimeraPregunta();
});

socket.on('start-game', () => {
  window.location.href = '/juego.html';
});

socket.on('pregunta', (pregunta) => {
  preguntaInput.value = pregunta.pregunta;
  opcionAButton.textContent = pregunta.opciones.A;
  opcionBButton.textContent = pregunta.opciones.B;
  opcionCButton.textContent = pregunta.opciones.C;
  opcionDButton.textContent = pregunta.opciones.D;
});

socket.on('resultado', (resultado) => {
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = resultado;
});

opcionAButton.addEventListener('click', () => {
  const respuesta = opcionAButton.textContent;
  socket.emit('respuesta', respuesta);
});

opcionBButton.addEventListener('click', () => {
  const respuesta = opcionBButton.textContent;
  socket.emit('respuesta', respuesta);
});

opcionCButton.addEventListener('click', () => {
  const respuesta = opcionCButton.textContent;
  socket.emit('respuesta', respuesta);
});

opcionDButton.addEventListener('click', () => {
  const respuesta = opcionDButton.textContent;
  socket.emit('respuesta', respuesta);
});


socket.on('player-disconnected', (username) => {
  const playerList = document.getElementById('player-list');
  const li = playerList.querySelector(':contains("' + username + '")');
  if (li) {
    playerList.removeChild(li);
  }

});
