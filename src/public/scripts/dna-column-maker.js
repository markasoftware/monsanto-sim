//this can create dna column things!

function createDNAColumn(person, pawnTraits, isMain){
    //create the root column element
    var dnaCol = document.createElement('div');
    if(arguments[3])
        dnaCol.style.opacity = '0';
    dnaCol.classList.add('dna-column');
    dnaCol.id = person.name;
    if(isMain) dnaCol.classList.add('dna-column-left');
    var dnaColInner = document.createElement('div');

    //add names and stuff
    var nameElt = document.createElement('div');
    nameElt.classList.add('dna-padder');
    nameElt.textContent = person.name;
    dnaCol.appendChild(nameElt);

    dnaColInner.classList.add('dna-column-inner');
    dnaCol.appendChild(dnaColInner);

    //now add price
    if(!isMain){
        var priceElt = document.createElement('div');
        priceElt.classList.add('dna-padder', 'dna-money');
        priceElt.textContent = '$' + person.price;
        dnaCol.appendChild(priceElt);
    }

    //create the 2 gene subcolumns
    //fuck it
    function doTheThingy(){
        var blap = document.createElement('div');
        blap.classList.add('dna-icon-column');
        return blap;
    }

    var geneSubCol1 = doTheThingy(), geneSubCol2 = doTheThingy(), dnaIconSubCol = doTheThingy();

    //add everything together!
    dnaColInner.appendChild(geneSubCol1);
    dnaColInner.appendChild(dnaIconSubCol);
    dnaColInner.appendChild(geneSubCol2);

    //create a basic dna icon element
    var genericDnaIconElt = document.createElement('div');
    genericDnaIconElt.classList.add('dna-icon-container');
    var genericDnaIconImg = document.createElement('img');
    genericDnaIconImg.classList.add('dna-icon-img');
    genericDnaIconImg.setAttribute('src', 'images/dna.svg');
    genericDnaIconElt.appendChild(genericDnaIconImg);

    //for consistency
    var createIconElt = function(){return genericDnaIconElt.cloneNode(true)}

    //private function to create the element for an allele
    function createAlleleElt(letter, traitID, oort){
        var alleleElt = document.createElement('div');
        alleleElt.classList.add('allele');
        alleleElt.id = person.name + traitID + oort;
        alleleElt.textContent = letter;
        return alleleElt;
    };

    //get letters and traits

    var letters = [], traitList = [];
    pawnTraits.forEach(function(curTrait) {
        letters.push(curTrait.letter);
        traitList.push(curTrait.trait);
    });

    person.genes.forEach(function(curPair, curIndex){
        geneSubCol1.appendChild(createAlleleElt(curPair[0] ? letters[curIndex].toUpperCase() : letters[curIndex], curIndex, 1));
        geneSubCol2.appendChild(createAlleleElt(curPair[1] ? letters[curIndex].toUpperCase() : letters[curIndex], curIndex, 2));
        if (curIndex % 2 === 0) dnaIconSubCol.appendChild(createIconElt());
    });
    
    return dnaCol;
};
