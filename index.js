//Servidor

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

app.use(express.static("public"));

const io = new Server(httpServer, {});

// var idInterval= setInterval(enviar,5000);

const preguntas = require('./public/preguntas.json');


// function enviar(){
//     console.log("enviant missatge");
//     io.emit("time",{message:"among us"});
// }

//variables compartides per tots els usuaris
var usuaris = [];

io.on("connection", (socket) => {
  
    console.log('Connectat un client...')

    socket.on("nickname", function(data) {
            console.log(data.nickname)

            socket.data.nickname = data.nickname;

            
            // respondre al que ha enviat, respon el servidor al client
            socket.emit("nickname rebut",{"response":"ok"})

            // respondre a la resta de clients menys el que ha enviat
            socket.broadcast.emit("nickname rebut",{"response": data.nickname});

            // Totes les funcions disponibles les tenim a
            //  https://socket.io/docs/v4/emit-cheatsheet/
    })

    socket.on("get users", function(data) {
        const users = [];
      
        for (let [id, socket] of io.of("/").sockets) {
          users.push({
            userID: id,
            username: socket.data.nickname,
          });
        }
      
        socket.emit("users", users);
        // ...
      });

    socket.on("disconnect", function() {
        console.log("usuari desconectat: " + socket.data.nickname)

    })

    socket.join('preguntas');

  // Enviar una pregunta aleatoria a los usuarios en la sala "preguntas"
  const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
  io.to('preguntas').emit('nueva-pregunta', pregunta);

});

  //  socket.on("respuesta", (data) => {
  //     console.log("Respuesta recibida del cliente: ", data);
  //     const respuestas = data;
  //   });

httpServer.listen(3000, ()=>
    console.log(`Server listening at http://localhost:3000`)
);

