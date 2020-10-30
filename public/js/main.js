var socket = io();
var gInstrumentNumber = 1;

var knobs = {
    'cutoffFrequency': document.getElementById("cfKnob"),
    'amplitude': document.getElementById("amplitudeKnob"),
    'pulseWidth': document.getElementById("pwKnob"),
    'harmonics': document.getElementById('harmonicsKnob'),
    'attack': document.getElementById('attackKnob'),
    'decay': document.getElementById('decayKnob'),
    'sustain': document.getElementById('sustainKnob'),
    'release': document.getElementById('releaseKnob'),
    'multiplier': document.getElementById('multiplierKnob')
}

document.getElementById("instrument").addEventListener('change', (event)=>{
    changeInstrument(parseInt(event.target.value));
});

usernameInput = document.getElementById("username");
usernameInput.addEventListener('change', ()=>{
    changeName(usernameInput.value);
});

document.getElementById("panic").addEventListener('click', (event)=>{
    console.log("PANIC!!!");
    for (var i=1; i<=12; i++){
        csound.ControlChange(i, 123);
    }
});

function changeName(newName){
    localStorage.setItem('username', newName);
    socket.emit('set name', newName);
}

function changeInstrument(instrumentNumber){
    console.log("changing instrument");
    gInstrumentNumber = instrumentNumber;
    socket.emit('change instrument', instrumentNumber);
}

function init() {
    console.log("init");
    socket.emit('init');

    var username = localStorage.getItem('username')
    if (username){
        usernameInput.value = username;
        changeName(username);
    }

    for (const [parameter, knob] of Object.entries(knobs)) {
        knob.addEventListener("input",(event)=>{
            local_parameter_change(parameter, event.target.value);
        });
    }
}

socket.on('instrument data', function(instrumentNumber, instrumentData){
    console.log("Got Instument Data");
    for (const [parameter, value] of Object.entries(instrumentData)) {
        SetParameter(instrumentNumber, parameter, value)
    }
});

function local_note_on(noteValue, velocity=90){
    socket.emit('note on', gInstrumentNumber, noteValue, velocity);
    Play(gInstrumentNumber, noteValue, velocity);
}

socket.on('note on', function(channel, noteValue, velocity){
    console.log(`Playing note ${noteValue}, ${velocity} on ${channel}`);
    Play(channel, noteValue, velocity);
});

function local_note_off(noteValue){
    socket.emit('note off', gInstrumentNumber, noteValue);
    Stop(gInstrumentNumber, noteValue);
}

socket.on('note off', function(channel, noteValue){
    Stop(channel, noteValue);
});

function local_parameter_change(parameter, value) {
    socket.emit('parameter change', gInstrumentNumber, parameter, value);
    SetParameter(gInstrumentNumber, parameter, value);
}

socket.on('parameter change', function(channel, parameter, value){
    SetParameter(channel, parameter, value);
});

socket.on('user data', function (userdata) {
    var userTableBody = document.getElementById("users").querySelector('tbody');
    userTableBody.innerHTML = "";
    for (var userID in userdata) {
        var user = userdata[userID];
        userRow = `<tr><td>${user.name}</td><td>${user.channel}</td></tr>`;
        userTableBody.innerHTML += userRow;
    }
});

function getCommonString(instrumentNumber) {
    return `instr ${instrumentNumber}
    iAtt chnget "attack${instrumentNumber}"
    iDec chnget "decay${instrumentNumber}"
    iSus chnget "sustain${instrumentNumber}"
    iRel chnget "release${instrumentNumber}"
    kEnv madsr iAtt, iDec, iSus, iRel
    icps = cpsmidi()
    kAmp chnget "amplitude${instrumentNumber}"
    kCutoffFrequency chnget "cutoffFrequency${instrumentNumber}"`
}

function getInstrumentString(instrumentNumber) {
    return `
    ${getCommonString(instrumentNumber)}
    a1 vco2 kAmp, icps
    a2 moogvcf a1, kCutoffFrequency, 0.8
    outs a2*kEnv,a2*kEnv
    endin`
}

function getVco2String(instrumentNumber, iMode = 0) {
    return `
    ${getCommonString(instrumentNumber)}
    iMode = ${iMode}
    kPulseWidth chnget "pulseWidth${instrumentNumber}"
    a1 vco2 kAmp, icps, iMode, kPulseWidth
    a2 moogvcf a1, kCutoffFrequency, 0.8
    outs a2*kEnv,a2*kEnv
    endin`
}

function getOscilString(instrumentNumber){
    return `
    ${getCommonString(instrumentNumber)}
    a1 oscil kAmp, icps
    a2 moogvcf a1, kCutoffFrequency, 0.8
    outs a2*kEnv,a2*kEnv
    endin`
}

function getGBuzzString(instrumentNumber){
    return `
    gicos ftgen 0, 0, 2^10, 11, 1
    ${getCommonString(instrumentNumber)}
    kHarmonics chnget "harmonics${instrumentNumber}"
    kMultiplier chnget "multiplier${instrumentNumber}"
    klh  =     1          ; lowest harmonic
    a1 gbuzz kAmp, icps, kHarmonics, klh, kMultiplier, gicos
    a2 moogvcf a1, kCutoffFrequency, 0.8
    outs a2*kEnv,a2*kEnv
    endin`
}

function getOrchestraString(numberOfInstruments = 1) {
    var orchestraString = "";
    for (var i=1; i<= numberOfInstruments; i++){
        orchestraString += `
        massign ${i},${i}`
    }
    for (var i=1; i<= numberOfInstruments; i++){
        switch (i) {
            case 1:
                // Triange Wave
                orchestraString += getVco2String(i, 12);
                break;
            case 2:
                // Square Wave
                orchestraString += getVco2String(i, 10);
                break;
            case 3:
                // integrated Sawtooth Wave
                orchestraString += getVco2String(i, 8);
                break;
            case 4:
                // Pulse Wave
                orchestraString += getVco2String(i, 6);
                break;
            case 5:
                // Sawthooth/Triangle/Ramp Wave
                orchestraString += getVco2String(i, 4);
                break;
            case 6:
                // Square/PWM Wave
                orchestraString += getVco2String(i, 2);
                break;
            case 7:
                // Sawthooth Wave
                orchestraString += getVco2String(i, 0);
                break;
            case 8:
                // Sine Wave
                orchestraString += getOscilString(i);
                break;
            case 9:
                // GBuzz Wave
                orchestraString += getGBuzzString(i);
                break;
            default:
                orchestraString += getInstrumentString(i);
        }

    }
    console.log(orchestraString);
    return orchestraString;
}

function makeDisplays() {
    scopeNode = CsoundObj.CSOUND_AUDIO_CONTEXT.createAnalyser();
    csound.Csound.getNode().connect(scopeNode);

    scope = function() {

        let ctx = document.getElementById('scope').getContext('2d');
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let timeData = new Uint8Array(scopeNode.frequencyBinCount);
        let scaling = height / 256;
        let risingEdge = 0;
        let edgeThreshold = 5;
        scopeNode.getByteTimeDomainData(timeData);

        ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#3300ff";
        ctx.beginPath();


        while (timeData[risingEdge++] - 128 > 0 && risingEdge <= width);
        if (risingEdge >= width) risingEdge = 0;
        while (timeData[risingEdge++] - 128 < edgeThreshold &&
        risingEdge <= width);
        if (risingEdge >= width) risingEdge = 0;
        for (var x = risingEdge; x < timeData.length &&
        x - risingEdge < width; x++)
        ctx.lineTo(x - risingEdge, height - timeData[x] * scaling);
        ctx.stroke();

        requestAnimationFrame(scope);
    }

    scope();

    mags = function() {
        let ctx = document.getElementById('mags').getContext('2d');
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;
        let freqData = new Uint8Array(scopeNode.frequencyBinCount);
        let scaling = height / 256;

        scopeNode.getByteFrequencyData(freqData);

        ctx.fillStyle = 'rgba(0, 20, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ff3300";
        ctx.beginPath();

        for (var x = 0; x < width; x++)
        ctx.lineTo(x, height - freqData[x] * scaling);

        ctx.stroke();
        requestAnimationFrame(mags);
    }
    mags();
}

function moduleDidLoad() {
    console.log("working");
    console.log = handleMessage;
    console.warn = handleMessage;
    csound.Play();
    csound.CompileOrc(getOrchestraString(12));
    init();
    if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then(WebMIDI_init, WebMIDI_err);
    else
        console.log("No WebMIDI support");
    makeDisplays();
}
var count = 0;

var enableLogs = false;

function handleMessage(message) {
    if (!enableLogs){
        return;
    }
    var element = document.getElementById('console');
    element.value += message;
    element.scrollTop = 99999; // focus on bottom
    count += 1;
    if (count == 1000) {
        element.value = ' ';
        count = 0;
    }
}

function onMIDIEvent(event) {
    switch (event.data[0] & 0xf0) {
    case 0x90:
        if (event.data[2]!=0) {
            local_note_on(event.data[1], event.data[2]);
            return;
        }
    case 0x80:
        local_note_off(event.data[1], event.data[2]);
        return;
    }
}

function WebMIDI_init(midi_handle) {
    var haveDevs = false;
    var devs = midi_handle.inputs.values();
    for ( var m = devs.next(); m && !m.done; m = devs.next()) {
        m.value.onmidimessage = onMIDIEvent;
        haveDevs = true;
    }
    if (!haveDevs)
        console.log("No MIDIDevs");
    else {
        console.log("WebMIDI support enabled");
    }
}

function WebMIDI_err(err) {
    console.log("Error starting WebMIDI");
}

// click handler
function Play(channel, note, velocity,) {
    csound.NoteOn(channel, note, velocity);

}

function Stop(channel, note) {
    csound.NoteOff(channel, note, 127);
}

document.getElementById("kbd").addEventListener("change",(event)=>{
    console.log(event.note);
    bOnOff = event.note[0];
    noteValue = event.note[1];
    noteValue+= 60;
    switch (bOnOff) {
        case 1:
            local_note_on(noteValue);
            return;
        case 0:
            local_note_off(noteValue);
            return;
    }
});


// set parameter
function SetParameter(channel, parameter, value) {
    var name = parameter + channel;
    csound.SetChannel(name , value);
    console.log("\n********Setting - " + name + ": " + value + "****************\n");
    if (channel == gInstrumentNumber) {
        knobs[parameter].setValue(value);
    }
}

var started = false;

document.getElementById("start").addEventListener("click",(event)=>{
    if (started == false) {
        console.log("starting the midi");
        CsoundObj.CSOUND_AUDIO_CONTEXT.resume();
        started = true;
    }
});
