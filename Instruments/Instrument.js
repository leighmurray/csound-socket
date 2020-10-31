class BaseInstrument {
    amplitude = 0.5;
    cutoffFrequency = 14000;
    attack = 0.01;
    decay = 0.0;
    sustain = 1.0;
    release = 0.01;
}

class PulseWidthInstrument extends BaseInstrument {
    pulseWidth = 0.5;
}

class GBuzzInstrument extends BaseInstrument {
    harmonics = 1;
    multiplier = 1;
}

class SubSynthInstrument extends PulseWidthInstrument {
    type = 2;
    octave = 0;
    cent = 0;
    amplitudeTwo = 0.5;
    typeTwo = 1;
    octaveTwo = -1;
    centTwo = 20;
    filterAttack = 0.01;
    filterDecay = 1;
    filterSustain = 0.01;
    filterRelease = 0.1;
    filterResonance = 0.3;
}


module.exports =  {
    "BaseInstrument": BaseInstrument,
    "PulseWidthInstrument": PulseWidthInstrument,
    "GBuzzInstrument": GBuzzInstrument,
    'SubSynthInstrument': SubSynthInstrument
}
