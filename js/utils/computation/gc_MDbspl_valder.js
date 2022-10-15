/**
 * Funzione che calcola la matrice bs attraverso la sua formula ricorrente
 * @method gc_MDbspl_valder
 * @param  {Array}         evalutatinPoint Punti di valutazione della funzione ricorrente
 * @return {Matrix}        bs              Matrice bs (evalutatinPoint X numeroBreakPoint)
 */
function gc_MDbspl_valder( param, evalutatinPoint ){

    var bs = [];
    var lenghtPartizioneT = param.partizioneNodaleT.length;
    var scaledPartition = scaled_param(param);
    var vettoreIntervallinodali = findInt(param, evalutatinPoint);

    var numberEvalutationPoint = evalutatinPoint.length;
    var temp = [];
    var beta = [];
    var kk = 0;



    for(var i = 0 ; i < numberEvalutationPoint ; i++){
        bs[i] = new Array();
        for(var j = 0 ; j < lenghtPartizioneT; j ++){
            bs[i][j] = new Array();
            for(var z = 0 ; z < kk + 1; z++){
                bs[i][j][z] = 0;

            }
        }
    }


    for(var i = 0 ; i < numberEvalutationPoint ; i++){
       var l = vettoreIntervallinodali[i];
       bs[i][l][0] = 1;
       fl[i] = [];
       fl[i][1] = l;

       var ix1 = findInx(param, evalutatinPoint[i], param.indiciPartizioneNodaleT[l]);

       var x1 = param.breakPoint[ix1];

       var g = param.degree[ix1];
       var gck = Math.min(g , kk);
       var xx = (scaledPartition.paramd.breakPoint[ix1] + (evalutatinPoint[i] - x1) / g);
       var k = l;
       for(var count = 0 ; count < g; count++){
            for(var mycount = 0 ; mycount < count + 1; mycount++){
                temp[mycount]  = 0;
            }

            if(count < g - 1){

                var gr = count + 1;

            }else {

                var gr = 1;

            }
            for(var j = l; j <= k ; j++){

                if(count < g - 1){

                    var d1 =evalutatinPoint[i] - param.partizioneNodaleT[j];
                    var d2 = param.partizioneNodaleS[count + j - g] - evalutatinPoint[i];

                }else{
                    var d1 = xx - scaledPartition.t[j];
                    var d2 = scaledPartition.s[count + j - g] - xx;
                }

                beta[0] = bs[i][j][0]/ (d1 + d2);
                bs[i][j - 1][0] = d2 * beta[0] + temp[0];
                temp[0] = d1 * beta[0];
                var ij = 0;
                for (var gc = g - gck + 1; gc <= count + 1; gc++){

                    ij++;
                    beta[ij] = bs[i][j][ij - 1] / (d1 + d2);
                    bs[i][j - 1][ij] = gr * (temp[ij] - beta[ij]);
                    temp[ij] = beta[ij];

                }
            }

            bs[i][k][0] = temp[0];



            ij = 0;
            for(var gc = g - gck + 1; gc <= count + 1; gc++){
                  ij++;
                bs[i][k][ij] = gr * temp[ij];

            }
            l = l - 1;
        }
        fl[i][0] = l;

    }
    return {bs:bs, fl:fl};
}
