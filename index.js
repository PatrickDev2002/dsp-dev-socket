const express = require("express")
const { createServer } = require("node:http")
const path = require("node:path")
const { join } = require('node:path')
const { Server } = require('socket.io')

const app = express()
const server = createServer(app)
const port = 5000
const io = new Server(server)

const usedPseudos = new Set()

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

    socket.on("joinChannel", (channelName) => {
        socket.join(channelName)
        console.log("Nouvel utilisateur a rejoint le canal " + channelName)
    })

    socket.on("CanSmessage", (data) => {
        io.to(data.channel).emit("CanCmessage", { message: data.message, id: socket.id, pseudo: socket.pseudo })
    })

    socket.on("checkPseudo", (pseudo, callback) => {
        if (usedPseudos.has(pseudo)) {
            callback(false)
        } else {
            callback(true)
        }
    });

    socket.on("setPseudo", (pseudo) => {
        usedPseudos.add(pseudo)
        socket.pseudo = pseudo
    });
})

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'))
})

app.get("/channel/:name", (req, res) => {
    res.sendFile(join(__dirname, "channel.html"))
})

app.get('/reset-pseudos', (req, res) => {
    usedPseudos.clear();
    res.send('Pseudos réinitialisés');
})

server.listen(port,() => {
    console.log("http://localhost:"+port+" a démarré correctement")
})