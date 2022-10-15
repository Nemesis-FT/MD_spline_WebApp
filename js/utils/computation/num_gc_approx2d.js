function num_gc_approx2d(controlPoint, pointShape, param, param1, np){
    var mpk = param.partizioneNodaleT.length;
    var x = linspace(param.estremoA, param.estremoB, np);
    var myStruct = gc_MDbspl_valder(param, x);
    var mybs = myStruct.bs;
    var myfl = myStruct.fl;
    var period = param.continuity[param.indicePrimoBreakPoint];
    var myPointShape = calculateMatrixControl(mybs, myfl, controlPoint, pointShape, period);

    param1.partizioneNodaleT = [];
    param1.partizioneNodaleS = [];
    param1.indiciPartizioneNodaleT = [];
    param1.indiciPartizioneNodaleS = [];
    param1 = partizioniNodali(param1);
    var mpkk = param1.partizioneNodaleT.length;
    var myStruct2 = gc_MDbspl_valder(param1, x);
    if (period > -1){
//caso periodico
      var mybss = myStruct2.bs;
      var ds = dual_alg2(mybss);
      var aa = zeros(mpkk, mpkk);
      for(var i = 0; i < mpkk; i++){
        for(var j = 0; j < mpkk ; j++){
         aa[i][j] = dual_inner_prod(ds[i],ds[j]);
        }
      }
      var dual = zeros(np, mpkk);
      for(i = 0; i < mpkk; i++){
        for(j = 0; j < mpkk; j++)
            dual = sommatoria(dual , i, math.multiply(aa[i][j] , getcolumByIndex(mybss, j)));
      }
      var px_dual = [];
      var py_dual = [];
      for(i = 0; i < mpkk ; i++){
        px_dual[i] = dual_inner_prod(trasformX(myPointShape), getcolumByIndex(dual, i));
        py_dual[i] = dual_inner_prod(trasformY(myPointShape), getcolumByIndex(dual, i));
      }
      period = param1.continuity[param1.indicePrimoBreakPoint];
      var gg,j,temp;
      gg=period+1;
      for (i=0; i<=period; i++){
        j=mpkk-gg+i;
        temp=0.5*(px_dual[i]+px_dual[j]);
        px_dual[j]=temp;
        px_dual[i]=temp;
        temp=0.5*(py_dual[i]+py_dual[j]);
        py_dual[j]=temp;
        py_dual[i]=temp;
      }
   }else{
//caso non periodico; minimi quadrati vincolati a partire dal primo punto e
//arrivare nell'ultimo
//np è il numero di punti da approssimare
    if(mpkk > 2){
      var qx = [];
      var qy = [];
      if (CONSTRAIN==1){
        for(var i = 1; i< np-1; i++){
          qx[i-1] = myPointShape[i].x - myStruct2.bs[i][0]*myPointShape[0].x - myStruct2.bs[i][mpkk-1]*myPointShape[np-1].x;
          qy[i-1] = myPointShape[i].y - myStruct2.bs[i][0]*myPointShape[0].y - myStruct2.bs[i][mpkk-1]*myPointShape[np-1].y;
        }
        var mybss =  new Array(np-2);
        for (var i=0; i<np-2; i++)
          mybss[i]= myStruct2.bs[i+1].slice(1,mpkk-1);
        np=np-2;
        mpkk=mpkk-2;
      }else{
        for(var i = 0; i< np; i++){
          qx[i] = myPointShape[i].x;
          qy[i] = myPointShape[i].y;
        }
        var mybss = myStruct2.bs;
      }
      var ds = dual_alg2(mybss);
      var aa = zeros(mpkk, mpkk);
      for(var i = 0; i < mpkk; i++){
        for(var j = 0; j < mpkk ; j++){
         aa[i][j] = dual_inner_prod(ds[i],ds[j]);
        }
      }
      var dual = zeros(np, mpkk);
      for(i = 0; i < mpkk; i++)
        for(j = 0; j < mpkk; j++)
            dual = sommatoria(dual , i, math.multiply(aa[i][j] , getcolumByIndex(mybss, j)));
      var px_dual = [];
      var py_dual = [];
      if (CONSTRAIN==1){
        for(i = 0; i < mpkk ; i++){
          px_dual[i+1] = dual_inner_prod(qx, getcolumByIndex(dual, i));
          py_dual[i+1] = dual_inner_prod(qy, getcolumByIndex(dual, i));
        }
        mpkk=mpkk+2;
        np=np+2;
        px_dual[0]=myPointShape[0].x;
        py_dual[0]=myPointShape[0].y;
        px_dual[mpkk-1]=myPointShape[np-1].x;
        py_dual[mpkk-1]=myPointShape[np-1].y;
      }else{
        for(i = 0; i < mpkk ; i++){
          px_dual[i] = dual_inner_prod(qx, getcolumByIndex(dual, i));
          py_dual[i] = dual_inner_prod(qy, getcolumByIndex(dual, i));
        }
      } 
     }else{
      var px_dual = [];
      var py_dual = [];
      px_dual[0]=myPointShape[0].x;
      py_dual[0]=myPointShape[0].y;
      px_dual[1]=myPointShape[np-1].x;
      py_dual[1]=myPointShape[np-1].y;
     }
   }
   return {'param' : param1, 'cpx': px_dual, 'cpy' : py_dual};
}

function getcolumByIndex(matrix, index){
  var result = [];
  for(var riga = 0 ; riga < matrix.length; riga++){
    result.push(Number(matrix[riga][index]));
  }
  return result;
}

function sommatoria(arrayToSom, index, array){
  var sommaParziale = [];
  for(var i = 0; i < arrayToSom.length ; i++){
     arrayToSom[i][index] = arrayToSom[i][index] + array[i];
  }
  return arrayToSom;
}

function trasformX(myarray){
  var result = [];
  for(var i = 0; i < myarray.length ; i++){
    result[i] = myarray[i].x;
  }
  return result;
}

function trasformY(myarray){
  var result = [];
  for(var i = 0; i < myarray.length ; i++){
    result[i] = myarray[i].y;
  }
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
