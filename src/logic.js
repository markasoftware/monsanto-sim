var chance = (new (require('chance'))());
var data = require('./data.js');
var traits = data.traits;

module.exports.gs = (isM) => isM ? 'monsanto' : 'opposition';

module.exports.hasTrait = (traitPair, isDominant) => {
    return isDominant ? traitPair[0] || traitPair[1] : traitPair[0] && traitPair[0];
}

module.exports.genMate = (traitList, isMale, namePool) => {
    var newName;
    do {
        newName = chance.first({gender: isMale ? 'male' : 'female'});
    } while (namePool.indexOf(newName) !== -1);
    namePool.push(newName);
    var mate = {
        genes: [],
        male: isMale,
        name: newName,
        price: chance.natural({min: 200, max: 400})
    };
    traitList.forEach(function(){
        mate.genes.push([chance.bool(), chance.bool()]);
    });
    return mate;
}
