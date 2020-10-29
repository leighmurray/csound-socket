var amplitudeKnob = document.getElementById("amplitudeKnob");
var cutoffFrequencyKnob = document.getElementById("cfKnob");
var socket = io();

function local_note_on(noteValue){
    socket.emit('note on', noteValue);
}

socket.on('note on', function(noteValue){
    Play(noteValue);
});

function local_note_off(noteValue){
    socket.emit('note off', noteValue);
}

socket.on('note off', function(noteValue){
    Stop(noteValue);
});

function local_amplitude_change(amplitude)
{
    socket.emit('amplitude', amplitude);
}
socket.on('amplitude', function(amplitude){
    SetAmp(amplitude);
});
function local_cutoff_frequency_change(cutoffFreqency)
{
    socket.emit('cutoff frequency', cutoffFreqency);
}
socket.on('cutoff frequency', function(cutoffFreqency){
    SetCutoffFrequency(cutoffFreqency);
});

function moduleDidLoad() {
    console.log("working");
    console.log = handleMessage;
    console.warn = handleMessage;
    csound.Play();
    csound.CompileOrc(
        `0dbfs = 1
        nchnls = 2
        massign 1,1
        instr 1
        icps = cpsmidi()
        chnset icps, \"freq\"
        kAmp chnget \"amp\"
        kCutoffFrequency chnget "cf"
        k1 linenr 0.5,0.01,0.1, 0.01
        a1 vco2 kAmp, icps
        a2 moogvcf a1, kCutoffFrequency, 0.8
        outs a2,a2
        endin`
    );
    SetAmp(.2);
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
        csound.NoteOn(1, event.data[1], event.data[2]);
        return;
        }
    case 0x80:
        csound.NoteOff(1, event.data[1], event.data[2]);
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

var playing = false;
// click handler
function Play(note) {
    csound.NoteOn(1, note, 60);
    playing = true;
}

function Stop(note) {
    if (playing) {
        csound.NoteOff(1, note, 60);
        playing = false;
    }
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


amplitudeKnob.addEventListener("input",(event)=>{
    local_amplitude_change(event.target.value);
});

cutoffFrequencyKnob.addEventListener("input",(event)=>{
    local_cutoff_frequency_change(event.target.value);
});

// set amplitude
function SetAmp(value) {
    SetParam('amp', value, 1., 0.0);
    amplitudeKnob.setValue(value);
}

function SetCutoffFrequency(value) {
    SetParam('cf', value, 1., 0.0);
    cutoffFrequencyKnob.setValue(value);
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


