
const socket = io();

const nicknameInput = document.getElementById("nicknameInput");
const sendButton = document.getElementById("sendButton");
sendButton.addEventListener("click", send)

function send() {
    socket.emit("nickname", {nickname: nicknameInput.value} )
    // redirigir a la vista quiz.html
    window.location.href = "quiz.html";
}

socket.on('nickname rebut', function(data) {

    console.log(data)

    socket.emit("get users", {})

})

socket.on('time', function(data) {

    console.log(data)

})

socket.on('users', function(data) {

    console.log(data)
    
})
