function gc_mesh_new(param,numeroDiPunti){
      if(numeroDiPunti < 2){
         numeroDiPunti = 2;
      }
      var result = [];
      var period = param.continuity[param.indicePrimoBreakPoint];

      for(var i = param.indicePrimoBreakPoint; i < param.indiceUltimoBreakPoint; i++){
         result = result.concat((linspace(param.breakPoint[i], param.breakPoint[i + 1], numeroDiPunti)));
      }
//      if (period > -1){
//        var result_copy = [];
//        for (var i = 0; i < result.length-1; i++)
//           result_copy[i]=result[i];
//        result = _.cloneDeep(result_copy);
//      }
      return result;
}

/**
 * Funzione di supporto che crea una successione di punti
 * @method linspace
 * @param  {float} a indice d inizio
 * @param  {float} b indice di fine
 * @param  {Integer} n numero di punti in [a,b]
 * @return {Array}   punti equispaziati in [a,b]
 */
function linspace(a,b,n) {
   var i,h,ret = Array(n);
   h = (b-a)/(n-1);
   for (i=0; i<n; i++)
     ret[i] = a + i*h;
   return ret;
}
