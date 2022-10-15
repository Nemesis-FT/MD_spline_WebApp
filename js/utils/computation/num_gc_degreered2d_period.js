function num_gc_degreered2d_period(controlPoint, pointShape, param, ide){
    param_orig=_.cloneDeep(param);

    param.degree[ide]=param.degree[ide] - 1;

    param_orig = partizioniNodali(param_orig);
    var param_new = _.cloneDeep(param_orig);

    param_new.breakPoint=[];
    var jj=0;
    for (var ii=param.indicePrimoBreakPoint; ii<=param.indiceUltimoBreakPoint; ii++){
       param_new.breakPoint[jj]=param.breakPoint[ii];
       jj++;
    }
    param_new.estremoA=param.estremoA;
    param_new.estremoB=param.estremoB;
    param_new.indicePrimoBreakPoint= 0;
    param_new.indiceUltimoBreakPoint= param.indiceUltimoBreakPoint-param.indicePrimoBreakPoint + 1;

    jj=0;
    param_new.degree=[];
    for (var ii=param.indicePrimoBreakPoint; ii<param.indiceUltimoBreakPoint; ii++){
       param_new.degree[jj]=param.degree[ii];
       jj++;
    }
    var period = Math.min(param.continuity[param.indicePrimoBreakPoint],param.continuity[param.indiceUltimoBreakPoint]);
    param_new.continuity=[];
    param_new.continuity[0]=period;
    jj=1;
    for (var ii=param.indicePrimoBreakPoint+1; ii<param.indiceUltimoBreakPoint; ii++){
       param_new.continuity[jj]=param.continuity[ii];
       jj++;
    }
    param_new.continuity[jj]=period;

    if(period>-1)
        param_new=gc_period(param_new,period);

    param=_.cloneDeep(param_new);

    np= 2 * param_orig.partizioneNodaleT.length;
    var myStruct =num_gc_approx2d(controlPoint,pointShape,param_orig,param,np);
    var cpx = myStruct.cpx;
    var cpy = myStruct.cpy;
    controlPoint = [];
    for(var i = 0; i < cpx.length; i++){
         controlPoint[i] = {x:cpx[i] , y:cpy[i]};
    }

//    return {cpx: myStruct.cpx, cpy: myStruct.cpy , param: param1};
    return {'param': param, 'controlPoint': controlPoint};
}
