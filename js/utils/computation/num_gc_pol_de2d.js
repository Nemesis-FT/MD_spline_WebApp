function num_gc_pol_de2d(controlPoint, ide, param){

    var x1 = param.breakPoint[ide];
    var g = param.degree[ide];
    var l = findInt(param,x1);

    l = l[0];

    var nt = param.partizioneNodaleT.length;

    var scaledParam = scaled_param(param);

    var param1 = _.cloneDeep(param);

    param1.degree[ide] = param.degree[ide] + 1;

    var myparamd = _.cloneDeep(partizioniNodali(param1));

//    myparamd.numeroControlPoint = myparamd.numeroControlPoint + 1;

    var scaledParam2 = scaled_param(myparamd);
    var cpxd = [];
    var cpyd = [];


    for(var mycounter = 0; mycounter < controlPoint.length; mycounter++){

        cpxd[mycounter] = controlPoint[mycounter].x;
        cpyd[mycounter] = controlPoint[mycounter].y;
    }

    for(var k = nt - 1; k >= l; k--){
        cpxd[k + 1] = cpxd[k];
        cpyd[k + 1] = cpyd[k];
    }

    for(k = l - g + 1  ; k <= l; k++){

        var den = (scaledParam.s[k - 1] - scaledParam.t[k]);
        cpxd[k] = (controlPoint[k].x - controlPoint[k - 1].x)/den;
        cpyd[k] = (controlPoint[k].y - controlPoint[k - 1].y)/den;
    }


    var tempArrayX = [];
    var tempArrayY = [];
    for(var myconter = l - g + 1 ; myconter <= l; myconter++ ){
        tempArrayX.push(cpxd[myconter]);
        tempArrayY.push(cpyd[myconter]);
    }


    var myStruct = gc_pol_de2d(g - 1,tempArrayX,tempArrayY);


    var mytemp = 0;
    for(var temp = l - g + 1; temp <= l + 1 ; temp++){
        cpxd[temp] = myStruct.cx[mytemp];
        cpyd[temp] = myStruct.cy[mytemp];
        mytemp++;
    }

    for(k = l - g + 1; k <= l + 1 ; k++){
        var num = scaledParam2.s[k - 1] - scaledParam2.t[k];

        cpxd[k] = num * cpxd[k] + cpxd[k - 1];
        cpyd[k] = num * cpyd[k] + cpyd[k - 1];
    }

    var temp = [];
    for(var i = 0; i < cpxd.length ; i++){
        temp.push({x: cpxd[i], y: cpyd[i]})

    }

    return {'param': myparamd, 'controlPoint': temp};
}
