var chance = (new (require('chance'))());
var chalk = require('chalk');
var data = require('./data.js');
var traits = data.traits;

module.exports.gs = (isM) => isM ? 'monsanto' : 'opposition';

module.exports.hasTrait = (traitPair, isDominant) => {
    return isDominant ? (traitPair[0] || traitPair[1]) : !(traitPair[0] || traitPair[1]);
}
var hasTrait = module.exports.hasTrait;

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
        price: chance.natural({min: 150, max: 250})
    };
    traitList.forEach(function(){
        mate.genes.push([chance.bool(), chance.bool()]);
    });
    return mate;
}

module.exports.genericDmgProcessor = (baseDmg, dmgVariation, critData, mainData) => {
    var multiplier = 1;
    var critChance = critData.chance || 0;
    var critDmg = critData.dmg || 0;
    var wasCrit = false;
    mainData.forEach(function(curData){
        switch(curData.type){
            case 'standard' : {
                if(curData.hasTrait)
                multiplier += curData.boost;
                break;
            }
            case 'critChance' : {
                if(curData.hasTrait)
                    critChance += curData.boost;
                break;
            }
            case 'critDmg' : {
                if(curData.hasTrait)
                    critDmg += curData.boost;
                break;
            }
            default : {
                console.error(chalk.red('unknown trait type in genericDmgProcessor: ' + curData.type));
                break;
            }
        }
    });
    //critical processing
    console.log(chalk.grey('crit chance: ' + critChance));
    if(chance.bool({likelihood: critChance})){
        multiplier = critDmg;
        wasCrit = true;
        console.log(chalk.grey('critical'));
    }
    //multiply it
    baseDmg *= multiplier;
    console.log(chalk.grey('multiplier: ' + multiplier));
    console.log(chalk.grey('final base dmg: ' + baseDmg));
    //randomize
    var finalDmg =  chance.natural({min: baseDmg - dmgVariation, max: baseDmg + dmgVariation});
    console.log(chalk.grey('final dmg: ' + finalDmg));
    return {
        dmg: finalDmg,
        crit: wasCrit
    }
}

module.exports.genMultipleMates = (scienceGenes, traitList, isMale, namePool) => {
    console.log(chalk.blue('generating multiple mates'));
    var newM88s = [];
    var overridden = (typeof scienceGenes === 'number');
    var numOfMates = overridden ? scienceGenes : 1;
    if(!overridden){
        if(hasTrait(scienceGenes[0], true))
            ++numOfMates;
        if(hasTrait(scienceGenes[1], true))
            ++numOfMates;
    }
    console.log(chalk.grey('number of mates: ' + numOfMates));
    for(var k = 0; k < numOfMates; ++k) {
        var m88 = module.exports.genMate(traitList, isMale, namePool);
        m88.price = module.exports.genericDmgProcessor(
                200,
                50,
                false,
                [{
                    type: 'standard',
                    hasTrait: overridden ? false : hasTrait(scienceGenes[2], true),
                    boost: -0.15
                },
                {
                    type: 'standard',
                    hasTrait: overridden ? false : hasTrait(scienceGenes[3], false),
                    boost: -0.35
                }]).dmg;
        newM88s.push(m88);
    }
    return newM88s;
}
