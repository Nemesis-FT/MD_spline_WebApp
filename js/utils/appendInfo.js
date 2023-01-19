function appendInfo(myparam){
    var numeroSegmenti = myparam.indiceUltimoBreakPoint-myparam.indicePrimoBreakPoint;
    var numberBreakPoint = '';
    var numberDegree = '';
    var arrayBreakpointToPrint = [];
    var arrayPartizioneNodaleT = [];
    var arrayPartizioneNodaleS = [];
    var period = myparam.continuity[myparam.indicePrimoBreakPoint];
    for(var i = 0 ; i < myparam.breakPoint.length ; i++){
        arrayBreakpointToPrint[i] = convert(myparam.breakPoint[i].toFixed(DIGIT));
    }
    for(var i = 0 ; i < myparam.partizioneNodaleT.length; i++){
        arrayPartizioneNodaleT[i] = convert(myparam.partizioneNodaleT[i].toFixed(DIGIT));
        arrayPartizioneNodaleS[i] = convert(myparam.partizioneNodaleS[i].toFixed(DIGIT));
    }
    if(period > -1){
        var stringBreakpoint = '<label class="col-2 col-form-label"> ' + _.slice(arrayBreakpointToPrint, 0, myparam.indicePrimoBreakPoint) + ' [ '+ _.slice(arrayBreakpointToPrint, myparam.indicePrimoBreakPoint, myparam.indiceUltimoBreakPoint+1) + ' ] '+_.slice(arrayBreakpointToPrint, myparam.indiceUltimoBreakPoint+1)+'</label>';
        var stringDegree =  '<label class="col-2 col-form-label" style="margin-right: 8px;">' + _.slice(myparam.degree, 0, myparam.indicePrimoBreakPoint) + ' [ '+ _.slice(myparam.degree, myparam.indicePrimoBreakPoint, myparam.indiceUltimoBreakPoint) + ' ] '+_.slice(myparam.degree, myparam.indiceUltimoBreakPoint)+'</label>';
        var stringContinuity = '<label class="col-2 col-form-label" style="margin-right: 8px;">' + _.slice(myparam.continuity, 0, myparam.indicePrimoBreakPoint) + ' [ '+ _.slice(myparam.continuity, myparam.indicePrimoBreakPoint, myparam.indiceUltimoBreakPoint+1) + ' ] '+_.slice(myparam.continuity, myparam.indiceUltimoBreakPoint+1)+'</label>'

    }
    else{
        var stringBreakpoint = '<label class="col-2 col-form-label"> [ '+arrayBreakpointToPrint+' ] </label>'
        var stringDegree = '<label class="col-2 col-form-label"> [ '+myparam.degree+' ] </label>'
        var stringContinuity = '<label class="col-2 col-form-label"> [ '+ myparam.continuity +' ] </label>'
    }
    var info =

    '<div>'
    + '<label class="col-2 col-form-label">Number of segments</label> '
    + '<label class="col-2 col-form-label">' + numeroSegmenti + '</label>'
    + '</div>'
    +'<div>'
    + '<label class="col-2 col-form-label">Number of Control Points</label> '
    + '<label class="col-2 col-form-label">' + arrayPartizioneNodaleT.length + '</label>'
    + '</div>'
    + '<div>'
    +    '<label class="col-2 col-form-label" style="margin-right: 8px"> Break-points:</label>'
    +    '<div class="col-10">'
    +        '<input class="form-control" type="text" value=' +arrayBreakpointToPrint+ '>'
    +    '</div>'
    +'</div>'
    + '<div>'
    +    '<label class="col-2 col-form-label" style="margin-right: 8px">Degrees:</label>'
    +    '<div class="col-10">'
    +        '<input class="form-control" type="text" value=' +myparam.degree+ '>'
    +    '</div>'
    +'</div>'
    + '<div>'
    +    '<label class="col-2 col-form-label" style="margin-right: 8px">Continuities:</label>'
    +    '<div class="col-10">'
    +        '<input class="form-control" type="text" value=' +myparam.continuity+ '>'
    +    '</div>'
    +'</div>'
    +'<div>'
    +    '<label class="col-2 col-form-label"> Left Knot Partition:</label>'
    +    '<div class="col-10">'
    +        '<input class="form-control" type="text" value=' +arrayPartizioneNodaleT+ '>'
    +    '</div>'
    +'</div>'
    +'<div>'
    +    '<label class="col-2 col-form-label"> Right Knot Partition:</label>'
    +    '<div class="col-10">'
    +        '<input class="form-control" type="text" value=' +arrayPartizioneNodaleS+ '>'
    +    '</div>'
    +'</div>'


    $('#infoShape').empty();
    $('#infoShape').append(info);
}

function convert(value){
    var lunghezza = value.length;
    var result = '';
    value = value.toString()

    while( value[lunghezza - 1] !== '.' ){
        if(value[lunghezza - 1] !== '0'){
            break;
        }
        lunghezza--;
    }

    if((value.length - lunghezza) == DIGIT){
        result = value.substr(0,lunghezza - 1);

    }else{
        result = value.substr(0,lunghezza);
    }
    return result;
}
