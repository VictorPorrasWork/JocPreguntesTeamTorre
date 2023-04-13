const socket = io();

fetch('/preguntas.json')
  .then(response => response.json())
  .then(data => {
    // Enviamos las preguntas al servidor
    socket.emit('preguntas', data);
  })
  .catch(error => console.error(error));

socket.on('pregunta', pregunta => {
  // Mostramos la pregunta
  console.log("hola")
  const preguntaEl = document.getElementById('pregunta');
  preguntaEl.textContent = pregunta.pregunta;

  // Mostramos las respuestas
  const respuestasEl = document.getElementById('respuestas');
  respuestasEl.innerHTML = '';
  for (let [clave, valor] of Object.entries(pregunta.respuestas)) {
    const inputEl = document.createElement('input');
    inputEl.type = 'radio';
    inputEl.id = clave;
    inputEl.name = 'respuesta';
    inputEl.value = clave;
    const labelEl = document.createElement('label');
    labelEl.textContent = `${clave}: ${valor}`;
    labelEl.htmlFor = clave;
    respuestasEl.appendChild(inputEl);
    respuestasEl.appendChild(labelEl);
    respuestasEl.appendChild(document.createElement('br'));
  }

  // Habilitamos el botón de enviar
  const enviarBtn = document.getElementById('enviar');
  enviarBtn.disabled = false;

  // Esperamos a que el usuario envíe su respuesta
  enviarBtn.addEventListener('click', () => {
    const respuesta = document.querySelector('input[name="respuesta"]:checked').value;
    socket.emit('respuesta', respuesta);
    enviarBtn.disabled = true;
  });
});
