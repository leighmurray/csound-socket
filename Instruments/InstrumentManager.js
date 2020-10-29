var Instrument = require('./Instrument');

class InstrumentManager {
    constructor (numOfInstruments) {
        console.log("creating " + numOfInstruments + " instruments");
        this.instruments = [];
        for (var i=0; i<numOfInstruments; i++) {
            this.instruments.push(new Instrument(i+1));
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
