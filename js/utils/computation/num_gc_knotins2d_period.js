function num_gc_knotins2d_period(controlPoint, pointShape, tc, param){

    var tol= 1.0e-7;
    var ntc = tc.length;
    var r = 0;
    var param_orig, param_new, np;
    if(ntc > 0){
        for(var l = 0 ; l < ntc; l++){
            param_orig = _.cloneDeep(param);

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
                    for(var temp = 1; temp < nx1 - 1; temp++){
                        param.degree[temp1] = param1.degree[temp];
                        temp1++;
                    }
                    param.indicePrimoBreakPoint = param1.indicePrimoBreakPoint - 1;
                    param.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint - 1;
                }
            }

            if(param1.estremoB <= tc[l]){
                if(param1.continuity[nx1-1] + 1 < param1.degree[nx1 - 2]){
                    param = _.cloneDeep(param1);
                    param.continuity[nx1-1] = param1.continuity[nx1-1] + 1;
                }else{
                    var temp1 = 0;
                    for(var temp = 0; temp < nx1-1; temp++){
                        param.breakPoint[temp1] = param1.breakPoint[temp];
                        param.continuity[temp1] = param1.continuity[temp];
                        temp1++;
                    }

                    temp1 = 0;
                    for(temp = 0; temp < nx1 - 2; temp++){
                        param.degree[temp1] = param1.degree[temp];
                        temp1++;
                    }

                    param.indicePrimoBreakPoint = param1.indicePrimoBreakPoint;
                    param.indiceUltimoBreakPoint = param1.indiceUltimoBreakPoint;
                }
            }

                param_orig = partizioniNodali(param_orig);
                param_new = _.cloneDeep(param_orig);
                param_new.breakPoint=[];
                var jj=0;
                for (var ii=param.indicePrimoBreakPoint; ii<=param.indiceUltimoBreakPoint; ii++){
                   param_new.breakPoint[jj]=param.breakPoint[ii];
                   jj++;
                }
                param_new.estremoA=param.estremoA;
                param_new.estremoB=param.estremoB;
                param_new.indicePrimoBreakPoint=0;
                param_new.indiceUltimoBreakPoint=param.indiceUltimoBreakPoint-param.indicePrimoBreakPoint + 1;
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
                if (period > -1)
                   param_new = gc_period(param_new, period);
                param = _.cloneDeep(param_new);
                np = 2 * param_orig.partizioneNodaleT.length;
                var myStruct =num_gc_approx2d(controlPoint,pointShape,param_orig,param,np);
//                 var myparam = _.cloneDeep(myStruct.param);
                var cpx = myStruct.cpx;
                var cpy = myStruct.cpy;
                controlPoint = [];
                for(var i = 0; i < cpx.length; i++){
                    controlPoint[i] = {x:cpx[i] , y:cpy[i]};
                }
          }
    }

    return {'param': param, 'controlPoint': controlPoint};

}
