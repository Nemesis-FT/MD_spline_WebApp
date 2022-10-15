function num_gc_degreered2d(controlPoint, pointShape, ide, param){
    var param1 = _.cloneDeep(param);

    param1.degree[ide] =  param.degree[ide] - 1;

    var np = 2 * controlPoint.length;

    var myStruct = num_gc_approx2d(controlPoint, pointShape, param, param1, np);

    param1 = _.cloneDeep(myStruct.param);

    param1 = partizioniNodali(param1);

    param1.numeroControlPoint = param1.partizioneNodaleT.length;

//GC
    mycontrolPoint = [];
    var mycontrolPoint = [];
    for(var i = 0; i < myStruct.cpx.length; i++){
//        mycontrolPoint[i] = {x:myStruct.cpx[i] , y:myStruct.cpy[i]};
        mycontrolPoint.push({x:myStruct.cpx[i], y:myStruct.cpy[i]})
    }
//    return {cpx: myStruct.cpx, cpy: myStruct.cpy , param: param1};
    return {param: param1, controlPoint: mycontrolPoint};
}


/**
 * Funzione che si occupa di creare le partizioni Nodali T e S per ogni breakPoint
 * @method partizioniNodali
 * @return {Array}        La struttura param aggiornata
 */
/*
function partizioniNodali(param){
    var ij = 0;
    for(var i = 0; i <= param.indiceUltimoBreakPoint - 1; i++){
            for(var j = 0 ; j < (param.degree[i] - param.continuity[i]); j++){
                param.partizioneNodaleT[ij] = param.breakPoint[i];
                param.indiciPartizioneNodaleT[ij] = i;
                ij++;
            }

    }

    ij = 0;
    for(var i = param.indicePrimoBreakPoint; i < param.degree.length; i++ ){
        for(var j = 0 ; j < (param.degree[i] - param.continuity[i + 1]) ; j++ ){
            param.partizioneNodaleS[ij] = (param.breakPoint[i + 1]);
            param.indiciPartizioneNodaleS[ij] =  i + 1 ;
            ij++;
        }
    }
    return param;
}
*/
