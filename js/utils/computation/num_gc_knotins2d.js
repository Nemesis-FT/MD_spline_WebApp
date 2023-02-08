
function num_gc_knotins2d(ControlPoint, tc, param){

    var tol= 1.0e-7;
    var ntc = tc.length;
    var r = 0;
    var k, ncp, nx, nx1, fr, j, gc_ind, gc_ind1, g, tpx, tpy;

    if(ntc > 0){
        for(var l = 0 ; l < ntc; l++){
            // console.log('************ l=',l,tc[l])
            // console.log('INIZIO');
            // console.log(_.cloneDeep(param));
            // console.log(_.cloneDeep(ControlPoint));
            // console.log(ControlPoint.length);
            ncp = ControlPoint.length;
            ncp = ncp + 1;
            nx = param.breakPoint.length;
            fr = 0;
            j = -1;

            while(j + 1 < nx && tc[l] >= (param.breakPoint[j + 1] - tol)){
                if(Math.abs(tc[l] - param.breakPoint[j+1])< tol){
                    fr = 1;
                }
                j = j + 1
            }

            gc_ind = j;
            var param1 = _.cloneDeep(param);

            if(fr == 1){
                param1.continuity[gc_ind] = param1.continuity[gc_ind] - 1;
                gc_ind1 = gc_ind;
                r = param1.degree[gc_ind1] - param1.continuity[gc_ind1] - 1;
                nx1 = nx;
              //                ncp = ncp + 1;

            }else{
                for(k = nx-1 ; k >= gc_ind+1 ; k-- ){

                    param1.breakPoint[k+1] = param1.breakPoint[k];
                    param1.continuity[k+1] = param1.continuity[k];
                }

                for(k = nx - 2; k >= gc_ind; k-- ){
                    param1.degree[k+1] = param1.degree[k];
                }

                param1.breakPoint[gc_ind+1] = tc[l];
                //  param1.continuity[gc_ind+1] = param1.degree[gc_ind] - 1;
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
            // console.log('j ed r')
            // console.log(j,r)
            for(k = ncp-1 ; k >= j - r ; k--){
                ControlPoint[k] = {x: ControlPoint[k-1].x, y: ControlPoint[k-1].y};
                // console.log(k);
            }

            var scaledParam = scaled_param(param1);

            if(tc[l] <= param.estremoA)
                scaledParam.s.unshift(scaledParam.s[0]);

            if(param.estremoB<=tc[l])
                scaledParam.s.pop();

            var xx = scaledParam.paramd.breakPoint[gc_ind1];
            k = j - r - 1;
            if(tc[l] >= param.estremoB)
                k = ncp - 2;

            g = param.degree[gc_ind];

        //  console.log('lunghezza partizioni nodali');
        //  console.log(scaledParam.t);
        //  console.log(scaledParam.s);
        //  console.log(j,g);

            while( k >= j - g && k>=1){
                var alfa = (xx - scaledParam.t[k]) / (scaledParam.s[k] - scaledParam.t[k]);
                tpx = (1 - alfa) * ControlPoint[k - 1].x + alfa * ControlPoint[k].x;
                tpy = (1 - alfa) * ControlPoint[k - 1].y + alfa * ControlPoint[k].y;
                ControlPoint[k] = {x: tpx, y: tpy};
                // console.log(k,alfa);
                k = k - 1;
            }

            if(param1.estremoA < tc[l] && tc[l] < param1.estremoB)
                param = _.cloneDeep(param1);

            if(tc[l] <= param1.estremoA){
                if(param1.continuity[0] + 1 < param1.degree[0]){
                    param1.continuity[0] = param.continuity[0] + 1;
                }else{
                    param1.breakPoint.shift();
                    param1.continuity.shift();
                    param1.degree.shift();
                    param1.indicePrimoBreakPoint = param1.indicePrimoBreakPoint - 1;
                    param1.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint - 1;
                    while (param1.continuity[0] == param1.degree[1]){
                        param1.breakPoint.shift();
                        param1.continuity.shift();    
                        param1.degree.shift();
                        param1.indicePrimoBreakPoint = param1.indicePrimoBreakPoint - 1;
                        param1.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint - 1;
                    }
                    nx1=param1.breakPoint.length;
                }
                param = _.cloneDeep(param1);
                    ControlPoint.shift();
            }

            if(param1.estremoB <= tc[l]){
                if(param1.continuity[nx1-1] + 1 < param1.degree[nx1 - 2]){
                    param1.continuity[nx1-1] = param1.continuity[nx1-1] + 1;
                }else{
                    param1.breakPoint.pop();
                    param1.continuity.pop();
                    param1.degree.pop();
                    nx1=nx1-1;
                    while (param1.continuity[nx1-1] == param1.degree[nx1-2]){
                        param1.breakPoint.pop();
                        param1.continuity.pop(); 
                        param1.degree.pop();
                        nx1=nx1-1;
                    }
                    param = _.cloneDeep(param1);
                    if (tc[l]==param1.estremoB)
                      ControlPoint.pop();
                }
            }
         }else
            param = _.cloneDeep(param1);

        //  console.log('FINE');
        //  console.log(_.cloneDeep(param));
        //  console.log(_.cloneDeep(ControlPoint));
        //  console.log(ControlPoint.length);
      }
    }

    return {param: param, controlPoint: ControlPoint};
}
