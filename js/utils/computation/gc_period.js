function gc_period(param,period){

    var nm = param.degree.length;
    var d0 = param.degree[0];
    param.breakPoint = param.breakPoint.reverse();
    param.continuity = param.continuity.reverse();
    param.degree = param.degree.reverse();
    var ccount = d0 - period;
    var i = 0;

    while(ccount < d0 + 1){
        ccount = ccount + param.degree[i] - param.continuity[i + 1];
        param.breakPoint[nm + i + 1] = param.breakPoint[nm] - (param.breakPoint[0] - param.breakPoint[i + 1]);
        param.continuity[nm + i + 1] = param.continuity[i + 1];
        param.degree[nm + i] = param.degree[i];
        i++;
    }
    param.indicePrimoBreakPoint = i;
    param.indiceUltimoBreakPoint = nm + i;
    param.continuity[nm + i] = ccount + param.continuity[nm + i] - d0 - 1;


    param.breakPoint = param.breakPoint.reverse();
    param.continuity = param.continuity.reverse();
    param.degree = param.degree.reverse();

    nm = nm + i - 1;

    d0 = param.degree[nm];
    ccount = d0 - period;

    i = 1;
    while(ccount < d0 + 1){
        ccount = ccount + param.degree[param.indicePrimoBreakPoint + i - 1] - param.continuity[param.indicePrimoBreakPoint + i];
        param.breakPoint[nm + i + 1] = param.breakPoint[param.indiceUltimoBreakPoint] + (param.breakPoint[param.indicePrimoBreakPoint + i] - param.breakPoint[param.indicePrimoBreakPoint]);
        param.continuity[nm + i + 1] = param.continuity[param.indicePrimoBreakPoint + i];
        param.degree[nm + i] = param.degree[param.indicePrimoBreakPoint + i -1];
        i++;
    }

    param.continuity[nm + i] = ccount + param.continuity[nm + i] - d0 - 1;

    return param;

}
