function compute_MDspline(controlPoint, pointShape, Point, Param){

    var myParam = _.cloneDeep(partizioniNodali(Param));
    var mpk = myParam.partizioneNodaleT.length;
    var period = myParam.continuity[myParam.indicePrimoBreakPoint];

    var myStruct2 = gc_MDbspl_valder(myParam, Point);
    var mypointShape = calculateMatrixControl(myStruct2.bs, myStruct2.fl, controlPoint, pointShape, period);

    return {bs: myStruct2.bs, fl: myStruct2.fl, pointShape: mypointShape};
}
