/**
 * Funzione che si occupa di recuperare l'indice di un determinato breakPoint 
 * indicato nel campo indice
 * @method findInx
 * @param  {Integer} point  punto da cercare
 * @param  {Integer} indice indice dell'intervallo nodale in cui si trova
 * @return {Integer}        Valore dell'indice del breakPoint
 */
function findInx(param, point, indice){

    var numberBreakPoint = _.cloneDeep(param.numeroBreakPoint);
    var m = 1
    var k = _.cloneDeep(param.indiceUltimoBreakPoint);
    for(var i = 0 ; i < m; i++){
        var l = indice;
        while((k - l) > 1){
            var mid = Math.floor((l +k)/2);
            if(point < param.breakPoint[mid])
                k = mid;
            else
                l = mid;
        }

    }
    return l;
}
