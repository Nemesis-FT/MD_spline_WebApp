/**
 * Funzione che si occupa di fare la moltiplicazione tra la matrice bs e il 
 * vettore dei controlPoint
 * @method calculateMatrixControl
 * @param  {Matrix} bs  Matrice di valutazione (m x nt) dove m e il numero di punti 
 *                      di valutazione e nt il numero di funzioni base
 * @param  {Matrix} fl  Matrice di indici delle B-spline non nulle per ogni punto
 * @param  {Array} controlPoint controlPoint
 * @param          period info se la curva e' chiusa e periodica o no
 * @param  {Array} contiene gli estremi degli indici dei punti di valutazione da
 *                 ricalcolare
 * @return {Array} punti valutati della curva
 */
function calculateMatrixControl(bs, fl, controlPoint, pointShape, period, ind){
//se la function viene chiamata senza l'ultimo parametro bisogna ricalcolare
//la curva su tutti i punti in cui si e' discretizzato l'intervallo
//altrimenti si ricalcola solo sui punti definiti dalla coppia (o due coppie)
//di indici contenuti nell'array ind
    if (arguments.length == 5){
       var result=[];
       var ind=[];
       ind[0]=0;
       ind[1]=bs.length;
    }else{
       var result = _.clone(pointShape);
    }

    var gg = 0;
    var mycontrolpoint = _.clone(controlPoint);

    if(period > - 1){
        gg = period + 1;
        for(var i = 0; i < gg; i++)
            mycontrolpoint.push(mycontrolpoint[i]);
    }

//    for(var r = 0 ; r < bs.length; r++ ){
  for (var i=0; i<ind.length; i=i+2){
    for(var r = ind[i] ; r < ind[i+1]; r++ ){
        result[r]  = {x:0, y:0};

        for(var j = fl[r][0] ; j <= fl[r][1]; j++){

            result[r].x = result[r].x + (bs[r][j][0] * mycontrolpoint[j].x);
            result[r].y = result[r].y + (bs[r][j][0] * mycontrolpoint[j].y);
         }
     }
  }

    return result;
}
