class Instrument {
    constructor(instrumentNumber)
    {
        this.amplitude = 0.5;
        this.cutoffFrequency = 3000;
        this.pulseWidth = 0.5;
        this.harmonics = 1;
        this.attack = 0.01;
        this.decay = 0.0;
        this.sustain = 1.0;
        this.release = 0.01;
        this.multiplier = 1;
    }
}

module.exports = Instrument;
