/**
 * Funzione che si occupa di recuperare l'indice del intervallo nodale t di un punto o 
 * una serie di punti
 * @method findInt
 * @param  {Array} evalutatinPoint  Punti di cui cercare il relativo indice in t
 * @return {Array}                  Array formato da indici indicanti per ogni 
 *                                  punto di valutazione il corrispettivo indice in t
 */
function findInt(param, evalutatinPoint){
    var t = _.cloneDeep(param.partizioneNodaleT);
    var nt = (param.partizioneNodaleT.length);
    var result = [];
    t.push(param.estremoB);
    nt = nt + 1;
    var nm = param.breakPoint.length;
    if(Array.isArray(evalutatinPoint)){
        var m = evalutatinPoint.length;
        var myevalutatinPoint = evalutatinPoint;
    }else{
        var m = 1;
        var myevalutatinPoint = [evalutatinPoint];
    }
    var k = 0;

    for(var i = 0 ; i < m ; i++){
        result[i] = 0;
        k = nt - 1;
        while (k - result[i] > 1) {
            var mid = Math.trunc((result[i] + k)/2);
            if(myevalutatinPoint[i] < t[mid])
                k = mid;
            else {
                result[i] = mid;
            }
        }
    }
    return result;

}
