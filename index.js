var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var InstrumentManager = require('./Instruments/InstrumentManager');

instrumentManager = new InstrumentManager(12);

app.use('/public', express.static('public'));
app.use('/examples', express.static('examples'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('init', () => {
    for (var i=1; i <= instrumentManager.instruments.length; i++)
    {
      instrument = instrumentManager.getInstrument(i);
      console.log(instrument);
      socket.emit('instrument data', i, instrument.amplitude, instrument.cutoffFrequency);
    }
  });
  socket.on('note on', (channel, note, velocity) => {
    console.log(`channel ${channel} - Note On: ${note} - v:${velocity}`);
    io.emit('note on', channel, note, velocity);
  });
  socket.on('note off', (channel, note) => {
    console.log(`channel ${channel} - Note Off: ${note}`);
    io.emit('note off', channel, note);
  });
  socket.on('amplitude', (channel, amplitude) => {
    console.log(`channel ${channel} - amplitude: ${amplitude}`);
    instrumentManager.setAmplitude(channel, amplitude);
    io.emit('amplitude', channel, amplitude);
  });
  socket.on('cutoff frequency', (channel, cutoffFrequency) => {
    console.log(`channel ${channel} - cutoff frequency: ${cutoffFrequency}`);
    instrumentManager.setCutoffFrequency(channel, cutoffFrequency);
    io.emit('cutoff frequency', channel, cutoffFrequency);
  });
  socket.on('change instrument', (instrumentNumber) => {
    console.log(`Changing to instrument: ${instrumentNumber}`);
    instrument = instrumentManager.getInstrument(instrumentNumber);
    console.log(instrument);
    socket.emit('instrument data', instrumentNumber, instrument.amplitude, instrument.cutoffFrequency);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
