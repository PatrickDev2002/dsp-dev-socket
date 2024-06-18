const express = require("express")
const { createServer } = require("node:http")
const { join } = require('node:path')
const { Server } = require('socket.io')

const app = express()
const server = createServer(app)
const port = 5000
const io = new Server(server)

io.on('connection', (socket) => {
    console.log('utilisateur connecté')

    socket.on("SMessage", (message) => {
        io.emit("CMessage", { msg: message, id: socket.id })
    });

    socket.on('typing', () => {
        socket.broadcast.emit('user typing', socket.id);
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('user stop typing', socket.id);
    });
    
    socket.on('disconnect', () => {
        console.log('utilisateur déconnecté')
    });
})

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'))
})

server.listen(port,() => {
    console.log("http://localhost:"+port+" a démarré correctement")
})