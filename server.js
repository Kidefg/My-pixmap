const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Настройки холста (должны совпадать с index.html)
const COLS = 50;
const ROWS = 50;
// Создаем пустой холст (заполненный белым цветом)
let canvasState = Array(COLS * ROWS).fill('#ffffff');

// Отдаем статические файлы (наш index.html)
app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('Игрок подключился:', socket.id);

    // 1. Сразу отправляем новому игроку текущее состояние всего холста
    socket.emit('init', canvasState);

    // 2. Когда кто-то красит пиксель
    socket.on('draw', (data) => {
        const { col, row, color } = data;
        
        // Проверка границ
        if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
            const index = row * COLS + col;
            canvasState[index] = color; // Сохраняем в памяти сервера

            // Рассылаем этот пиксель всем остальным
            socket.broadcast.emit('draw', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Игрок отключился');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен! http://localhost:${PORT}`);
});
