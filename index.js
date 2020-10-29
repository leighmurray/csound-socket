var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use('/public', express.static('public'));
app.use('/examples', express.static('examples'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('note on', (note) => {
    console.log("note on: " + note);
    io.emit('note on', note);
  });
  socket.on('note off', (note) => {
    console.log("note off: " + note);
    io.emit('note off', note);
  });
  socket.on('amplitude', (amplitude) => {
    console.log("amplitude: " + amplitude);
    io.emit('amplitude', amplitude);
  });
  socket.on('cutoff frequency', (cutoffFrequency) => {
    console.log("cutoff frequency: " + cutoffFrequency);
    io.emit('cutoff frequency', cutoffFrequency);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
