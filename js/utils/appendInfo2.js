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
        var stringBreakpoint = '<label> ' + _.slice(arrayBreakpointToPrint, 0, myparam.indicePrimoBreakPoint) + ' [ '+ _.slice(arrayBreakpointToPrint, myparam.indicePrimoBreakPoint, myparam.indiceUltimoBreakPoint+1) + ' ] '+_.slice(arrayBreakpointToPrint, myparam.indiceUltimoBreakPoint+1)+'</label>';
        var stringDegree =  '<label style="margin-right: 8px;">' + _.slice(myparam.degree, 0, myparam.indicePrimoBreakPoint) + ' [ '+ _.slice(myparam.degree, myparam.indicePrimoBreakPoint, myparam.indiceUltimoBreakPoint) + ' ] '+_.slice(myparam.degree, myparam.indiceUltimoBreakPoint)+'</label>';
        var stringContinuity = '<label style="margin-right: 8px;">' + _.slice(myparam.continuity, 0, myparam.indicePrimoBreakPoint) + ' [ '+ _.slice(myparam.continuity, myparam.indicePrimoBreakPoint, myparam.indiceUltimoBreakPoint+1) + ' ] '+_.slice(myparam.continuity, myparam.indiceUltimoBreakPoint+1)+'</label>'

    }
    else{
        var stringBreakpoint = '<label> [ '+arrayBreakpointToPrint+' ] </label>'
        var stringDegree = '<label> [ '+myparam.degree+' ] </label>'
        var stringContinuity = '<label> [ '+ myparam.continuity +' ] </label>'
    }
    var info =

    '<div>'
        + '<label>Number of segments</label> '
        + '<label>' + numeroSegmenti + '</label>'
    + '</div>'
    + '<div>'
    +    '<label style="margin-right: 8px"> Break-points:</label>'
    +     stringBreakpoint
    +'</div>'
    + '<div>'
    +    '<label style="margin-right: 8px">Degrees:</label>'
    +        stringDegree
    +'</div>'
    + '<div>'
    +    '<label style="margin-right: 8px">Continuities:</label>'
    +     stringContinuity
    +'</div>'
    +'<div>'
    +    '<label> Left Knot Partition</label>'
    +    '<div>'
    +        '<input class="form-control" type="text" value=' +arrayPartizioneNodaleT+ '>'
    +    '</div>'
    +'</div>'
    +'<div>'
    +    '<label> Right Knot Partition</label>'
    +    '<div>'
    +        '<input class="form-control" type="text" value=' +arrayPartizioneNodaleS+ '>'
    +    '</div>'
    +'</div>'


    $('#infoShape').empty();
    $('#infoShape').append(info);

}

function convert(value){
    var lunghezza = value.length;
    var result = '';

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
