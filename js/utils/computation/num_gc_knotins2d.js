
function num_gc_knotins2d(controlPoint, tc, param){

    var tol= 1.0e-7;
    var ntc = tc.length;
    var r = 0;
    if(ntc > 0){
        for(var l = 0 ; l < ntc; l++){

            //var ncp = controlPoint.length - 1;
            var ncp = controlPoint.length;
//            ncp = ncp + 1;
            var nx = param.breakPoint.length;
            var fr = 0;
            var j = -1;

            while(j + 1 < nx && tc[l] >= (param.breakPoint[j + 1] - tol)){
                if(Math.abs(tc[l] - param.breakPoint[j+1])< tol){
                    fr = 1;
                }
                j = j + 1
            }

            var gc_ind = j;
            var param1 = _.cloneDeep(param);
            if(fr == 1){

                param1.continuity[gc_ind] = param1.continuity[gc_ind] - 1;
                var gc_ind1 = gc_ind;
                r = param1.degree[gc_ind1] - param1.continuity[gc_ind1] - 1;
                var nx1 = nx;
                ncp = ncp + 1;

            }else{
                for(var k = nx-1 ; k >= gc_ind+1 ; k-- ){

                    param1.breakPoint[k+1] = param1.breakPoint[k];
                    param1.continuity[k+1] = param1.continuity[k];
                }

                for(k = nx - 2; k >= gc_ind; k-- ){
                    param1.degree[k+1] = param1.degree[k];
                }

                param1.breakPoint[gc_ind+1] = tc[l];
//                param1.continuity[gc_ind+1] = param1.degree[gc_ind] - 1;
                param1.continuity[gc_ind+1] = param1.degree[gc_ind];
                if(tc[l] < param.estremoA){
                    param1.indicePrimoBreakPoint = param.indicePrimoBreakPoint + 1
                }
                param1.indiceUltimoBreakPoint = param.indiceUltimoBreakPoint + 1
                if(param.estremoB < tc[l]){
                    param1.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint - 1;
                }

                gc_ind1 = gc_ind + 1;
                nx1 = nx + 1;
            }

        if (fr ==1 ){
            j = 0;
            for(var i = 0; i <= gc_ind; i++){
                j = j + param.degree[i] - param.continuity[i];
            }

            for(k = ncp-1 ; k >= j - r ; k--){
                if(typeof controlPoint[k] === 'undefined') controlPoint[k] = {x: 0, y :0};
                controlPoint[k].x = controlPoint[k - 1].x;
                controlPoint[k].y = controlPoint[k - 1].y;

            }

            var scaledParam = scaled_param(param1);

            if(tc[l] <= param.estremoA){
                for(var myconter = 1 ; myconter < ncp ; myconter++){
                    scaledParam.s[myconter] = scaledParam.s[myconter - 1];
                }
            }
            var xx = scaledParam.paramd.breakPoint[gc_ind1];
            k = j - r - 1;
            if(tc[l]> param.estremoB){
                k = ncp - 1;
            }

            var g = param.degree[gc_ind];

            while( k >= j - g && k>=1){
                var alfa = (xx - scaledParam.t[k]) / (scaledParam.s[k] - scaledParam.t[k]);
                controlPoint[k].x = (1 - alfa) * controlPoint[k - 1].x + alfa * controlPoint[k].x;
                controlPoint[k].y = (1 - alfa) * controlPoint[k - 1].y + alfa * controlPoint[k].y;
                k = k - 1;
            }
  }

            if(param1.estremoA < tc[l] && tc[l] < param1.estremoB){
                param = _.cloneDeep(param1);
            }

            if(tc[l] <= param1.estremoA){
                if(param1.continuity[0] + 1 < param1.degree[0]){
                    param = _.cloneDeep(param1);
                    param.continuity[0] = param.continuity[0] + 1;

                }else{
                    var temp1 = 0;
                    for(var temp = 1; temp < nx1; temp++){
                        param.breakPoint[temp1] = param1.breakPoint[temp];
                        param.continuity[temp1] = param1.continuity[temp];
                        temp1++;
                    }
                    temp1 = 0;
                    for(temp = 1; temp < nx1 - 1; temp++){
                        param.degree[temp1] = param.degree[temp];
                        temp1++;
                    }
                    param.indicePrimoBreakPoint = param1.indicePrimoBreakPoint - 1;
                    param.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint - 1;
                }
            }

            if(param1.estremoB <= tc[l]){
                if(param1.continuity[nx1-1] + 1 < param1.degree[nx1 - 2]){
                    param = _.cloneDeep(param1);
                    param.continuity = param1.continuity[nx1-1] + 1;
                }else{
                    var temp1 = 0;

                    for(var temp = 1; temp < nx1-1; temp++){
                        param.breakPoint[temp1] = param1.breakPoint[temp];
                        param.continuity[temp1] = param1.continuity[temp];
                        temp1++;
                    }

                    temp1 = 0;
                    for(temp = 1; temp < nx1 - 2; temp++){
                        param.degree[temp1] = param1.degree[temp];
                        temp1++;
                    }

                    param.indicePrimoBreakPoint = param1.indicePrimoBreakPoint - 1;
                    param.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint - 1;
                }

                for(var temp = 0; temp < ncp - 1; temp++){
                    controlPoint[temp].x = controlPoint[temp].x;
                    controlPoint[temp].y = controlPoint[temp].y;
                }
            }
        }
    }

    return {param: param, controlPoint: controlPoint};

}
