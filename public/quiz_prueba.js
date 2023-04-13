const socket = io();

// Definir variable para guardar las respuestas
let respuestas = {};

let index = 0;

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

    // Emitir la primera pregunta al cliente
    socket.emit('pregunta', pregunta);

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
        console.log("respuesta")
      } else {
        alert('Por favor selecciona una respuesta.');
      }
    });

// Manejar la respuesta del cliente
socket.on('respuesta', (data) => {
  // Guardar la respuesta del cliente en el objeto respuestas
  respuestas[socket.id] = data;

  // Mostrar la siguiente pregunta
  index++;
  if (index < preguntasCategoria.length) {
    const siguientePregunta = preguntasCategoria[index];
    socket.emit('pregunta', siguientePregunta);

    // Actualizamos el HTML con la siguiente pregunta y sus respuestas
    preguntaEl.textContent = siguientePregunta.pregunta;
    respuestasEl.innerHTML = '';
    for (let [clave, valor] of Object.entries(siguientePregunta.respuestas)) {
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
    
    // Habilitamos el botón de enviar para la siguiente pregunta
    enviarBtn.disabled = false;

  } else {
    // Si ya no hay más preguntas, emitir los resultados al cliente
    socket.emit('resultados', respuestas);
  }
});


  })
  .catch(error => {
    console.error(error);
    alert('Error al obtener las preguntas.');
  });
