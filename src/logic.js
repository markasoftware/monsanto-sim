var chance = (new (require('chance'))());

var traits = {
    lawyer: [
        'small chance boost',
        'large chance boost'
    ],
    scientist: [
        '2 mate options',
        '3 mate options'
    ],
    soldier: [
        'small damage boost',
        'large damage boost'
    ],
    special: [
        'small income boost',
        'large income boost'
    ]
}

module.exports.traits = traits;

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
