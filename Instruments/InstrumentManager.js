var Instruments = require('./Instrument');

class InstrumentManager {
    constructor (numOfInstruments) {
        console.log("creating " + numOfInstruments + " instruments");
        this.instruments = [];
        for (var i=1; i<=numOfInstruments; i++) {
            switch (i) {
                case 5:
                case 6:
                    this.instruments.push(new Instruments.PulseWidthInstrument());
                    break;
                case 9:
                    // GBuzz Wave
                    this.instruments.push(new Instruments.GBuzzInstrument());
                    break;
                case 10:
                    // SubSynth Waves
                    this.instruments.push(new Instruments.SubSynthInstrument());
                    break;
                default:
                    this.instruments.push(new Instruments.BaseInstrument());
                    break;
            }
        }
    }

    setParameter(instrumentNumber, parameter, value) {
        this.instruments[instrumentNumber-1][parameter] = value;
    }

    getInstrument(instrumentNumber) {
        return this.instruments[instrumentNumber-1];
    }
}

module.exports = InstrumentManager;
