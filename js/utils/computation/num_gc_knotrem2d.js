function num_gc_knotrem2d(controlPoint, pointShape, tc, param){
    var tol = 1.0e-7;
    var param_orig = _.cloneDeep(param);
    var ntc=tc.length;
    if (ntc>0){

        for (var l=0 ; l < ntc ; l++){
            nx= param.breakPoint.length;
            r=0;
            j=0;
            while(j+1 < nx && tc[l] >= (param.breakPoint[j+1] -tol)){
                if(Math.abs(tc[l] - param.breakPoint[j+1])<tol){
                    r=1;
                }
                j=j+1;
            }
            gc_ind=j;
            if (r==1){

                var g1=param.degree[gc_ind-1];
                var g2=param.degree[gc_ind];
                if (g1 != g2){
                    if (param.continuity[gc_ind] + 1 <= Math.min(g1,g2)){
                        param.continuity[gc_ind]=param.continuity[gc_ind] + 1;
                    }else{
                        alert('non e possibile aumentare ulteriormente la continuita');
                    }
                }else{
                    if (param.continuity[gc_ind] < g1-1){
                        param.continuity[gc_ind]=param.continuity[gc_ind] + 1;
                    }else{
                        if (param.continuity[gc_ind] == g1-1){
                          param.continuity[gc_ind]=param.continuity[gc_ind] + 1;
                        }else{
                          param.breakPoint=removeFromArray(param.breakPoint, gc_ind);
                          param.continuity=removeFromArray(param.continuity,gc_ind);
                          param.degree=removeFromArray(param.degree,gc_ind);
                          param.indiceUltimoBreakPoint=param.indiceUltimoBreakPoint-1;
                        }
                    }
                }
            }
        }
    }

//questa chiamata serve solo per sapere la dimensione dello spazio e passare
//np che è un numero di punti su cui approssimare.
    param_orig=partizioniNodali(param_orig);
//    np= 2 * param.partizioneNodaleT.length;
    np= 2 * param_orig.partizioneNodaleT.length;
    var myStruct =num_gc_approx2d(controlPoint,pointShape,param_orig,param,np);

    var myparam = _.cloneDeep(myStruct.param);
    var cpx = myStruct.cpx;
    var cpy = myStruct.cpy;
    var mycontrolPoint = [];
    for(var i = 0; i < cpx.length; i++){
        mycontrolPoint[i] = {x:cpx[i] , y:cpy[i]};
    }


    return {param : myparam, controlPoint : mycontrolPoint}
}


function removeFromArray(array , indexValue){
    var result = [];
    for(var i = 0; i < array.length; i++){
        if(i != indexValue){
            result.push(array[i]);
        }
    }
    return result;
}
