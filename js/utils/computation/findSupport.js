/**
 * Funzione che si occupa di recuperare gli indici degli interval breakpoint contenuti nel
 * supporto della B-spline di cui viene dato l'indice 
 * @method findSupport
 * @param  {Array} param  struttura contenente le informazioni sullo spazio spline
 * @param          bs_ind indice della B-spline
 * @return {Array}         array di 2 o 4 indici indicanti l'inizio e la fine degli 
 *                         interval break-point contenuti nel supporto della B-spline
 */
function findSupport(param, bs_ind){
    var result = [];
//il supporto e' dato da [ t[bs_ind] , s[bs_ind] ]
    result[0]=param.indiciPartizioneNodaleT[bs_ind];
    result[1]=param.indiciPartizioneNodaleS[bs_ind];
    if (paramd.continuity[paramd.indicePrimoBreakPoint] > -1){
//caso periodico: gli intervalli da rivalutare possono essere a cavallo
//del primo punto
        if (result[0] - param.indicePrimoBreakPoint < 0){
          result[3] = param.indiceUltimoBreakPoint-param.indicePrimoBreakPoint;
          result[2] = result[3]+result[0]-param.indicePrimoBreakPoint;
          result[1] = result[1] - param.indicePrimoBreakPoint;
          result[0] = 0;
        }
        else{
//caso non periodico
          result[0] = result[0] - param.indicePrimoBreakPoint;
          result[1] = result[1] - param.indicePrimoBreakPoint;
        }
    }

    return result;

}
