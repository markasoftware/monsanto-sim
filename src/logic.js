var chance = (new (require('chance'))());
var data = require('./data.js');
var traits = data.traits;

module.exports.hasTrait = (traitPair, isDominant) => {
    return isDominant ? traitPair[0] || traitPair[1] : traitPair[0] && traitPair[0];
}

module.exports.genMate = (traitList) => {
    var mate = [];
    traitList.forEach(function(){
        mate.push([chance.bool(), chance.bool()]);
    });
    return mate;
}
