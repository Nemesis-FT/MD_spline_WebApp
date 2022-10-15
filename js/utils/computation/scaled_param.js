/**
 * Funzione che si occupa di scalare la partizione nodale t e s
 * @method scaled_param
 * @return {[type]}     [description]
 */

function scaled_param(param){
    var paramd = _.cloneDeep(param);

    var nm = paramd.breakPoint.length;
    var t = [];
    var s = [];

    paramd.breakPoint[0] = 0;

    for(var i = 1 ; i < nm ; i++){
        paramd.breakPoint[i] = paramd.breakPoint[i - 1] + (param.breakPoint[i] - param.breakPoint[i - 1]) / param.degree[i - 1];

    }
    for(var i = 0; i < param.indiceUltimoBreakPoint; i++){

            for(var j = 0 ; j < (param.degree[i] - param.continuity[i]); ++j){
                t.push(paramd.breakPoint[i]);

            }
    }
    var ij = 0;
    for(var i = param.indicePrimoBreakPoint ; i < param.degree.length; i++ ){
        for(var j = 0 ; j < (param.degree[i] - param.continuity[i + 1]) ; j++ ){
            s[ij] = (paramd.breakPoint[i + 1]);
            ij++;
        }
    }

    return {t: t , s: s , paramd: paramd};

}
