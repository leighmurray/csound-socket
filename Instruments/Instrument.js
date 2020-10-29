class Instrument {
    constructor(instrumentNumber)
    {
        this.amplitude = 0.5;
        this.cutoffFrequency = 3000;
        this.pulseWidth = 0.5;
        this.clip = 0.5;
        this.skew = 0.0;
    }
}

module.exports = Instrument;
