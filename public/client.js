const socket = io();

const joinGameForm = document.getElementById('join-game-form');
const usernameInput = document.getElementById('username-input');

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

socket.on('player-disconnected', (username) => {
  const playerList = document.getElementById('player-list');
  const li = playerList.querySelector(':contains("' + username + '")');
  if (li) {
    playerList.removeChild(li);
}
});


