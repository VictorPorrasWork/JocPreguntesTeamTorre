const socket = io();

const joinGameForm = document.getElementById('join-game-form');
const usernameInput = document.getElementById('username-input');

const preguntaInput = document.getElementById('pregunta');
const opcionInputA = document.getElementById('opcion-a');
const opcionInputB = document.getElementById('opcion-b');
const opcionInputC = document.getElementById('opcion-c');
const opcionInputD = document.getElementById('opcion-d');

const respuestaButonA = document.getElementById('respuesta-a');
const respuestaButonB = document.getElementById('respuesta-b');
const respuestaButonC = document.getElementById('respuesta-c');
const respuestaButonD = document.getElementById('respuesta-d');


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

socket.on('start-game', () => {
  window.location.href = '/juego.html';
});

socket.on('start-game', (pregunta) => {
  preguntaInput.value = pregunta.pregunta;
  opcionInputA.value = pregunta.opciones["A"];
  opcionInputB.value = pregunta.opciones["B"];
  opcionInputC.value = pregunta.opciones["C"];
  opcionInputD.value = pregunta.opciones["D"];

  const respuesta_correcta = pregunta.respuesta_correcta;

  // Setear un temporizador para el usuario
  let tiempoRestante = 60; // 60 segundos
  const tiempoRestanteDiv = document.getElementById('tiempo-restante');
  tiempoRestanteDiv.textContent = tiempoRestante + ' segundos restantes';
  const interval = setInterval(() => {
    tiempoRestante--;
    tiempoRestanteDiv.textContent = tiempoRestante + ' segundos restantes';
    if (tiempoRestante === 0) {
      clearInterval(interval);
      // Continuar con la siguiente pregunta o finalizar el juego
    }
  }, 1000);
});

socket.on('respuesta', (respuestaSeleccionada) => {
  const respuesta_correcta = preguntaActual.respuesta_correcta;
  if (respuestaSeleccionada === respuesta_correcta) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '¡Respuesta correcta!';
  } else {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = 'Respuesta incorrecta. La respuesta correcta es ' + respuesta_correcta;
  }
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

        respuestaButonA.addEventListener('click', () => {
          const respuestaSeleccionada = 'A';
          socket.emit('respuesta', respuestaSeleccionada);
        });
        respuestaButonB.addEventListener('click', () => {
          const respuestaSeleccionada = 'B';
          socket.emit('respuesta', respuestaSeleccionada);
        });
        respuestaButonC.addEventListener('click', () => {
          const respuestaSeleccionada = 'C';
          socket.emit('respuesta', respuestaSeleccionada);
        });
        respuestaButonD.addEventListener('click', () => {
          const respuestaSeleccionada = 'D';
          socket.emit('respuesta', respuestaSeleccionada);
        });
      });
      socket.emit('preguntas-cargadas'); // Avisar al servidor que se han cargado las preguntas
    })
    .catch(error => {
      console.error('Error al cargar la primera pregunta:', error);
    });
}

socket.on('connect', () => {
  cargarPreguntas();
});


socket.on('respuesta', (respuestaSeleccionada) => {
  const respuesta_correcta = preguntaActual.respuesta_correcta;
  if (respuestaSeleccionada === respuesta_correcta) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = '¡Respuesta correcta!';
  } else {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = 'Respuesta incorrecta. La respuesta correcta es ' + respuesta_correcta;
  }
});


socket.on('player-disconnected', (username) => {
  const playerList = document.getElementById('player-list');
  const li = playerList.querySelector(':contains("' + username + '")');
  if (li) {
    playerList.removeChild(li);
  }

});
