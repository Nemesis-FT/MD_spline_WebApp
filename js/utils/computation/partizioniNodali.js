/**
 * Funzione che si occupa di creare le partizioni Nodali T e S per lo spazio MD
 * definito nella struttura param
 * @method partizioniNodali
 * @return {Array}        La struttura param aggiornata
 */
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
