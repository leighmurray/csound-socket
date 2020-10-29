class Instrument {
    constructor(instrumentNumber)
    {
        this.instrumentNumber = instrumentNumber;
        this.amplitude = 0.5;
        this.cutoffFrequency = 880;
    }
}

module.exports = Instrument;
