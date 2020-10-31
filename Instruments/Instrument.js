class Instrument {
    constructor(instrumentNumber)
    {
        this.amplitude = 0.5;
        this.cutoffFrequency = 14000;
        this.pulseWidth = 0.5;
        this.harmonics = 1;
        this.attack = 0.01;
        this.decay = 0.0;
        this.sustain = 1.0;
        this.release = 0.01;
        this.multiplier = 1;
        this.type = 2;
        this.octave = 0;
        this.cent = 0;
        this.amplitudeTwo = 0.5;
        this.typeTwo = 1;
        this.octaveTwo = -1;
        this.centTwo = 20;
        this.filterAttack = 0.01;
        this.filterDecay = 1;
        this.filterSustain = 0.01;
        this.filterRelease = 0.1;
        this.filterResonance = 0.3;
    }
}

module.exports = Instrument;
