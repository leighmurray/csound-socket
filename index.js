var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
var InstrumentManager = require('./Instruments/InstrumentManager');
var User = require('./Users/User');

var users = {};

instrumentManager = new InstrumentManager(12);

app.use('/public', express.static('public'));
app.use('/examples', express.static('examples'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  var userID = uuidv4();
  users[userID] = new User();
  console.log('a user connected');
  console.log(users);
  io.emit('user data', users);

  socket.on('init', () => {
    for (var i=1; i <= instrumentManager.instruments.length; i++)
    {
      instrument = instrumentManager.getInstrument(i);
      socket.emit('instrument data', i, instrument);
    }
  });

  socket.on('note on', (channel, note, velocity) => {
    console.log(`channel ${channel} - Note On: ${note} - v:${velocity}`);
    socket.broadcast.emit('note on', channel, note, velocity);
  });

  socket.on('note off', (channel, note) => {
    console.log(`channel ${channel} - Note Off: ${note}`);
    socket.broadcast.emit('note off', channel, note);
  });

  socket.on('parameter change', (channel, parameter, value) => {
    console.log(`channel ${channel} - ${parameter}: ${value}`);
    instrumentManager.setParameter(channel, parameter, value);
    socket.broadcast.emit('parameter change', channel, parameter, value);
  });

  socket.on('change instrument', (instrumentNumber) => {
    console.log(`Changing to instrument: ${instrumentNumber}`);
    instrument = instrumentManager.getInstrument(instrumentNumber);
    users[userID].channel = instrumentNumber;
    console.log(instrument);
    io.emit('user data', users);
    socket.emit('instrument data', instrumentNumber, instrument);
  });

  socket.on('set name', (newName) => {
    newName = newName.trim().substring(0, 32);
    if (!newName) {
      newName = "anon";
    }
    users[userID].name = newName;
    console.log(users);
    io.emit('user data', users);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete users[userID];
    console.log(users);
    io.emit('user data', users);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
