const socket = io();

// Obtenemos las preguntas del archivo preguntas.json
fetch('/preguntas.json')
  .then(response => response.json())
  .then(preguntas => {
    // Seleccionamos una categoría aleatoria
    const categorias = Object.keys(preguntas);
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];

    // Seleccionamos una pregunta aleatoria de la categoría
    const preguntasCategoria = preguntas[categoria];
    const pregunta = preguntasCategoria[Math.floor(Math.random() * preguntasCategoria.length)];

    // Mostramos la pregunta
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
      const respuesta = document.querySelector('input[name="respuesta"]:checked');
      if (respuesta) {
        socket.emit('respuesta', respuesta.value);
        enviarBtn.disabled = true;
        console.log('enviar')
      } else {
        alert('Por favor selecciona una respuesta.');
      }
    });
  })
  .catch(error => {
    console.error(error);
    alert('Error al obtener las preguntas.');
  });

socket.on('resultado', resultado => {
  alert(`Tu respuesta es ${resultado.correcta ? 'correcta' : 'incorrecta'}.`);
});
