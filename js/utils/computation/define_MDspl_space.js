/**
 * Funzione che preso il numero di controlPoint e il flag per indicare se una curva e aperta o no
 * inizializza la struttura globale param dove sono definite tutte le informazioni sulla curva
 * @method define_MDspl_space
 * @param  {Array}           controlPoint  Vettore contenente elemnti nella forma [{x: int, y: int}];
 * @param  {Boolean}           flag           Indica se una curva e aperta o no
 * @return {Void}                        struttura param inizializzata
 */
function define_MDspl_space(param, NcontrolPoint, period, degree, continuity){

    for(var i = degree + 1; i < NcontrolPoint; i++){
        param.ampiezzaSegmenti.push(1);
        param.degree.push(Number(degree));
        param.continuity.push(Number(continuity));
    }
    var numeroSegmenti = param.ampiezzaSegmenti.length;

    var temp = 0;
    for(var i = 0; i <= numeroSegmenti; i++){
        temp = _.sum(param.ampiezzaSegmenti.slice(0, i));
        param.breakPoint[i] = temp;
    }

    param.estremoA = param.breakPoint[0];
    param.estremoB = param.breakPoint[i - 1];
    param.indicePrimoBreakPoint = 0;
    param.indiceUltimoBreakPoint = numeroSegmenti;
    param = isClosedShape(param, period);
    param = partizioniNodali(param);
    param.numeroControlPoint = NcontrolPoint; //_.sum(param.degree.slice(0,param.numeroSegmenti)-param.continuity.slice(0, param.numeroSegmenti - 1))+param.degree[0] + 1;
    param.numeroBreakPoint = param.breakPoint.length - 1;
//    appendInfo(param);

    return param
}

/**
 * Funzione che aggiusta la struttura param in caso di una curva chiusa (DA FINIREEEE)
 * @method isClosedShape
 * @param  {Boolean}      flag variabile che mi esprime la volonta dell utente di fare una curva chiusa
 * @return {Array}        array delle continuita aggiustato
 */
function isClosedShape(param, period){
    if(period > -1){
        var result = [period];
        for(var i = 0 ; i < param.continuity.length ; i++){
            result.push(param.continuity[i]);
        }
        result.push(period);
        param.continuity = result;

        param = gc_period(param, period);

    }else{
        var result = [-1];
        for(var i = 0 ; i < param.continuity.length ; i++){
            result.push(param.continuity[i]);
        }
        result.push(-1);
        param.continuity = result;
    }
    return param;
}
