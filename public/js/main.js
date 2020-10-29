var amplitudeKnob = document.getElementById("amplitudeKnob");
var cutoffFrequencyKnob = document.getElementById("cfKnob");
var instrumentKnob = document.getElementById("instrumentKnob");
var socket = io();
var gInstrumentNumber = 1;

function changeInstrument(instrumentNumber){
    console.log("changing instrument");
    gInstrumentNumber = instrumentNumber;
    socket.emit('change instrument', instrumentNumber);
}

function init() {
    console.log("init");
    socket.emit('init');
}

function local_note_on(noteValue, velocity=90){
    socket.emit('note on', gInstrumentNumber, noteValue, velocity);
}

socket.on('instrument data', function(instrumentNumber, amplitude, cutoffFrequency){
    console.log("Got Instument Data");
    SetAmp(instrumentNumber, amplitude);
    SetCutoffFrequency(instrumentNumber, cutoffFrequency);
});

socket.on('note on', function(channel, noteValue, velocity){
    Play(channel, noteValue, velocity);
});

function local_note_off(noteValue){
    socket.emit('note off', gInstrumentNumber, noteValue);
}

socket.on('note off', function(channel, noteValue){
    Stop(channel, noteValue);
});

function local_amplitude_change(amplitude)
{
    socket.emit('amplitude', gInstrumentNumber, amplitude);
}

socket.on('amplitude', function(lInstrumentNumber, amplitude){
    SetAmp(lInstrumentNumber, amplitude);
});

function local_cutoff_frequency_change(cutoffFreqency)
{
    socket.emit('cutoff frequency', gInstrumentNumber, cutoffFreqency);
}

socket.on('cutoff frequency', function(lInstrumentNumber, cutoffFreqency){
    SetCutoffFrequency(lInstrumentNumber, cutoffFreqency);
});

function getInstrumentString(instrumentNumber) {
    return `
    instr ${instrumentNumber}
    icps = cpsmidi()
    chnset icps, \"freq\"
    kAmp chnget \"amp${instrumentNumber}\"
    kCutoffFrequency chnget "cf${instrumentNumber}"
    k1 linenr 0.5,0.01,0.1, 0.01
    a1 vco2 kAmp, icps
    a2 moogvcf a1, kCutoffFrequency, 0.8
    outs a2,a2
    endin`
}

function getOrchestraString(numberOfInstruments = 1) {
    var orchestraString = `0dbfs = 1
        nchnls = 2`;
    for (var i=1; i<= numberOfInstruments; i++){
        orchestraString += `
        massign ${i},${i}`
    }
    for (var i=1; i<= numberOfInstruments; i++){
        orchestraString += getInstrumentString(i);
    }
    console.log(orchestraString);
    return orchestraString;
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
}
var count = 0;

function handleMessage(message) {
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
    console.log("happening here instead");
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

instrumentKnob.addEventListener('input', (event)=>{
    changeInstrument(event.target.value);
});

amplitudeKnob.addEventListener("input",(event)=>{
    local_amplitude_change(event.target.value);
});

cutoffFrequencyKnob.addEventListener("input",(event)=>{
    local_cutoff_frequency_change(event.target.value);
});

// set amplitude
function SetAmp(instrumentNumber, value) {
    SetParam('amp' + instrumentNumber, value);
    if (instrumentNumber == gInstrumentNumber){
        amplitudeKnob.setValue(value);
    }
}

function SetCutoffFrequency(instrumentNumber, value) {
    SetParam('cf' + instrumentNumber, value);
    if (instrumentNumber == gInstrumentNumber){
        cutoffFrequencyKnob.setValue(value);
    }
}

// set parameter
function SetParam(name, value) {
    csound.SetChannel(name, value);
    console.log("Setting - " + name + ": " + value);
}

var started = false;

document.getElementById("start").addEventListener("click",(event)=>{
    if (started == false) {
        console.log("starting the midi");
        CsoundObj.CSOUND_AUDIO_CONTEXT.resume();
        started = true;
    }
});

document.getElementById("refresh").addEventListener("click",(event)=>{
    if (csound != null && csound.Csound != null)
        csound.Csound.destroy();
    location.reload();
});


