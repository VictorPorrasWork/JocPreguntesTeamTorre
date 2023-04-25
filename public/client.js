const socket = io();

const joinGameForm = document.getElementById('join-game-form');
const usernameInput = document.getElementById('username-input');

const preguntaInput = document.getElementById('pregunta');
const opcionInputA = document.getElementById('opcion-a');
const opcionInputB = document.getElementById('opcion-b');
const opcionInputC = document.getElementById('opcion-c');
const opcionInputD = document.getElementById('opcion-d');

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

function cargarPreguntas() {
  fetch('/../preguntas.json')
    .then(response => response.json())
    .then(preguntas => {
      preguntas.forEach((pregunta) => {
        preguntaInput.value = pregunta.pregunta;
        opcionInputA.value = pregunta.opciones["A"];
        opcionInputB.value = pregunta.opciones["B"];
        opcionInputC.value = pregunta.opciones["C"];
        opcionInputD.value = pregunta.opciones["D"];
      });
      })
    .catch(error => {
      console.error('Error al cargar la primera pregunta:', error);
    });
}

socket.on('connect', () => {
  cargarPreguntas();
});

socket.on('start-game', () => {
  window.location.href = '/juego.html';
});



socket.on('player-disconnected', (username) => {
  const playerList = document.getElementById('player-list');
  const li = playerList.querySelector(':contains("' + username + '")');
  if (li) {
    playerList.removeChild(li);
  }

});
