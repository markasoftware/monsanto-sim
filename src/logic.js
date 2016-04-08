var chance = (new (require('chance'))());
var data = require('./data.js');
var traits = data.traits;

module.exports.hasTrait = (traitPair, isDominant) => {
    return isDominant ? traitPair[0] || traitPair[1] : traitPair[0] && traitPair[0];
}

module.exports.genMate = (traitList) => {
    var male =  typeof arguments[1] !== 'undefined' ? !arguments[1] : chance.bool();
    var mate = {
        genes: [],
        male: male,
        name: chance.first({gender: male ? 'male' : 'female'}),
        price: chance.natural({min: 200, max: 400})
    };
    traitList.forEach(function(){
        mate.genes.push([chance.bool(), chance.bool()]);
    });
    return mate;
}
