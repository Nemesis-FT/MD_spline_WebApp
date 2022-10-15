function gc_pol_de2d(g, cpx, cpy){


    var gp1 = g + 1;
    var cpxd = [];
    var cpyd = [];
    cpxd[0] = cpx[0];
    cpyd[0] = cpy[0];
    cpxd[gp1] = cpx[gp1 - 1 ];
    cpyd[gp1] = cpy[gp1 - 1 ];
    for(var j = 0 ; j < g; j++ ){

        var alfa = gp1 - j - 1;
        cpxd[j+1] = (alfa * cpx[j + 1] + (j + 1) * cpx[j])/gp1;
        cpyd[j+1] = (alfa * cpy[j + 1] + (j + 1) * cpy[j])/gp1;
    }

    return {cx: cpxd, cy: cpyd};
}
