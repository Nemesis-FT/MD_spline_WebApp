/**
 * Funzione che si occupa di creare la matrice bs
 * @method mainVD_MDspl_new
 * @param  {Integer}         controlPoint Numero di controlPoint inseriti dall utente (mai minori di 4)
 * @param  {Integer}         NUMBER_POINT Numero di punti in cui valutare l intervallo
 * @param  {Boolean}        flag         M informa se la curva e chiusa o no
 * @return {Matrix}      bs           Ritorna la matrice bs valutata nel numero di punti di valutazione
 */
function mainVD_MDspl_new(param,NcontrolPoint,period,degree,continuity,NUMBER_POINT){

    param = define_MDspl_space(param, NcontrolPoint, period, degree, continuity)

    var pointToValutate = gc_mesh_new(param, NUMBER_POINT);

    pointGcMeshNew = _.cloneDeep(pointToValutate);

    var myStruct = gc_MDbspl_valder(param, pointToValutate);

    return {param: param, myStruct: myStruct};
}
