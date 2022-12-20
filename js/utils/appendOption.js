function appendOption(idPoint, param){
    var mycontinuity = Math.trunc((idPoint + 1) / NUMBER_POINT);

    if((idPoint % NUMBER_POINT == 0) || ((idPoint + 1) % NUMBER_POINT) == 0){
        $('#modalBody').empty();
        $('#modalBody').append(
        '<div class="row">'
        +   '<div class="col-md-12">'
        +       '<h3>(Deg-Cont-Deg) = ( ' +param.degree[mycontinuity + param.indicePrimoBreakPoint - 1] +  ' , ' + param.continuity[mycontinuity + param.indicePrimoBreakPoint] + ' , '+param.degree[mycontinuity + param.indicePrimoBreakPoint] +' )</h3>'
        +       '<button id="increaseContinuity" class="btn btn-success">Increase  continuity</button>'
        +       '<button id="decreaseContinuity" class="btn btn-danger">Decrease continuity</button>'
        +       '<button id="cancel" class="btn">Cancel</button>'
        +   '</div>'
        +'</div>'
        );
    }else{
        $('#modalBody').empty();
        $('#modalBody').append(
        '<div class="row">'
        +   '<div class="col-md-12">'
        +       '<h3>(Cont-Deg-Cont) = ( ' +param.continuity[mycontinuity + param.indicePrimoBreakPoint] +  ' , ' + param.degree[mycontinuity + param.indicePrimoBreakPoint] + ' , '+param.continuity[mycontinuity + 1 + param.indicePrimoBreakPoint] +' )</h3>'
        +       '<button id="insertBreakPoint" class="btn btn-primary">Insert breakPoint</button>'
        +       '<button id="increaseDegree" class="btn btn-success">Increase degree</button>'
        +       '<button id="decreaseDegree" class="btn btn-danger">Decrease degree</button>'
        +       '<button id="cancel" class="btn">Cancel</button>'
        +   '</div>'
        +'</div>');
    }

    $('#cancel').click(function(e){
        e.preventDefault();
        inblock = false;
        $('#modalBody').empty();
    })


    $('#increaseContinuity').click(function(e){
       e.preventDefault();
       var ibp = Math.trunc((idPoint + 1) / NUMBER_POINT);
       var ibp_orig = ibp;
       var period = param.continuity[param.indicePrimoBreakPoint];
       if(period > -1){
         ibp = ibp + param.indicePrimoBreakPoint;
       }

       var gc=0;
       var go=0;
       if((ibp == param.indicePrimoBreakPoint || ibp == param.indiceUltimoBreakPoint) && (param.continuity[ibp] + 1 == param.degree[ibp] || param.continuity[ibp] + 1 == param.degree[ibp - 1])){
          alert('Operation not permitted on first/last breakpoint');
          inblock = false;
          $('#modalBody').empty();
          return;
       }
       if (param.indicePrimoBreakPoint<ibp  && ibp<param.indiceUltimoBreakPoint && (param.degree[ibp]==param.degree[ibp - 1] || param.continuity[ibp]==0)){
//           var temp = [Number(pointGcMeshNew[idPoint].toFixed(DIGIT))];
            var temp = [pointGcMeshNew[idPoint]];
            gc=1;
            if (period > -1){
                var myStruct = num_gc_knotrem2d_period(controlPoint, pointShape, temp, param);
            }else
                var myStruct = num_gc_knotrem2d(controlPoint, pointShape, temp, param);
            go=1;
        }else{
            if ((ibp==param.indicePrimoBreakPoint || ibp==param.indiceUltimoBreakPoint) && period > -1 && (param.degree[ibp]==param.degree[ibp - 1] || param.continuity[ibp]==0)){
               var temp=[param.estremoA];
               var myStruct = num_gc_knotrem2d_period(controlPoint, pointShape, temp, param);
               go=1;
            }
        }

       if (go == 1){
          go=0;
          param = _.cloneDeep(myStruct.param);
          controlPoint = _.clone(myStruct.controlPoint);
          if (period > -1){
            period = param.continuity[param.indicePrimoBreakPoint];
            controlPoint=reduce_controlpoint(controlPoint,period);
          }

          if (gc==1){
             pointGcMeshNew = gc_mesh_new(param, NUMBER_POINT);
             gc=0;
          }
          var DrStruct = compute_MDspline(controlPoint,pointShape,pointGcMeshNew,param);
          bs = _.clone(DrStruct.bs);
          fl = _.clone(DrStruct.fl);
          paramd = _.cloneDeep(param);
          pointShape = _.clone(DrStruct.pointShape);
          redraw3(pointShape, period);
          appendInfo(paramd);
        }
        else alert('Operation not permitted! Segs '+ibp_orig+' and '+ Number(ibp_orig+ 1) +' have different degrees');

        inblock = false;
        $('#modalBody').empty();
        return;
    });


    $('#decreaseContinuity').click(function(e){
        e.preventDefault();
        var ibp = Math.trunc((idPoint + 1) / NUMBER_POINT);
        var period = param.continuity[param.indicePrimoBreakPoint];
        if(period > -1){
          ibp = ibp + param.indicePrimoBreakPoint;
        }
        if(paramd.continuity[ibp] > 0){
          var period = param.continuity[param.indicePrimoBreakPoint];
//          var temp = [Number(pointGcMeshNew[idPoint].toFixed(DIGIT))];
          var temp = [pointGcMeshNew[idPoint]];

          if (period > -1){
            var myStruct = num_gc_knotins2d_period_new(controlPoint, temp, param);
          }else
            var myStruct = num_gc_knotins2d(controlPoint, temp, param);

          param = _.cloneDeep(myStruct.param);
          controlPoint = _.clone(myStruct.controlPoint);

          // console.log(param);
          // console.log(controlPoint);

          var DrStruct = compute_MDspline(controlPoint,pointShape,pointGcMeshNew,param);
          bs = _.clone(DrStruct.bs);
          fl = _.clone(DrStruct.fl);
          paramd = _.cloneDeep(param);
          pointShape = _.clone(DrStruct.pointShape);

          period = paramd.continuity[paramd.indicePrimoBreakPoint];
//          redraw1(pointShape, controlPoint, period);
          redraw3(pointShape, period);
          appendInfo(paramd);
       }else{
          alert("Operation not permitted! Continuity cannnot be negative");
        }
        inblock = false;
        $('#modalBody').empty();
        return;
    });

    $('#increaseDegree').click(function(e){
        e.preventDefault();
        var numSeg = Math.trunc(idPoint / NUMBER_POINT) + 1;
        var period = param.continuity[param.indicePrimoBreakPoint];
        var ide=param.indicePrimoBreakPoint + numSeg - 1;
        var tc=[];
        var j=0;
        if (param.continuity[ide] > 1){
           for (var i=0; i<param.continuity[ide]-1; i++){
            tc[j]=param.breakPoint[ide];
            j++;
           }
         }
         if (param.continuity[ide+1] > 1){
           for (var i=0; i<param.continuity[ide+1]-1; i++){
            tc[j]=param.breakPoint[ide+1];
            j++;
           }
         }        
         if (j>0){
            if (period > -1)
               var myStruct = num_gc_knotins2d_period(controlPoint, pointShape, tc, param);
            else
               var myStruct = num_gc_knotins2d(controlPoint, tc, param);

            param = _.cloneDeep(myStruct.param);
            controlPoint = _.clone(myStruct.controlPoint);
            param = _.cloneDeep(partizioniNodali(param));
            period = param.continuity[param.indicePrimoBreakPoint];
         }

         if (period > -1){
            ide=param.indicePrimoBreakPoint + numSeg - 1;
            var myStruct2 = num_gc_pol_de2d_period(controlPoint, pointShape, ide, param);
         }else{
            var myStruct2 = num_gc_pol_de2d(controlPoint, ide, param);
         }
         param = _.cloneDeep(myStruct2.param);
         controlPoint = _.clone(myStruct2.controlPoint);

         if (period > -1){
              period = param.continuity[param.indicePrimoBreakPoint];
              controlPoint=reduce_controlpoint(controlPoint,period);
         }
        var DrStruct = compute_MDspline(controlPoint,pointShape,pointGcMeshNew,param);
        bs = _.clone(DrStruct.bs);
        fl = _.clone(DrStruct.fl);
        pointShape = _.clone(DrStruct.pointShape);
        paramd = _.cloneDeep(param);
        period = paramd.continuity[paramd.indicePrimoBreakPoint];
//          redraw1(pointShape, controlPoint, period);
        redraw3(pointShape, period);
        appendInfo(paramd);
        inblock = false;
        $('#modalBody').empty();
        return;
    });

    $('#decreaseDegree').click(function(e){
        e.preventDefault();
        var numSeg = Math.trunc(idPoint / NUMBER_POINT) + 1;
        var period = param.continuity[param.indicePrimoBreakPoint];
        var ide=param.indicePrimoBreakPoint + numSeg - 1;
        if (param.degree[ide] > 1){
          var tc=[];
          var j=0;
          if (param.continuity[ide] > 1){
            for (var i=0; i<param.continuity[ide]-1; i++){
              tc[j]=param.breakPoint[ide];
              j++;
            }
          }
          if (param.continuity[ide+1] > 1){
            for (var i=0; i<param.continuity[ide+1]-1; i++){
              tc[j]=param.breakPoint[ide+1];
              j++;
            }
          }
          if (j > 0){
            if (period > -1)
              var myStruct = num_gc_knotins2d_period(controlPoint, pointShape, tc, param );
            else
              var myStruct = num_gc_knotins2d(controlPoint,tc, param);

              param = _.cloneDeep(myStruct.param);
              controlPoint = _.clone(myStruct.controlPoint);
              param = _.cloneDeep(partizioniNodali(param));
//GC 15/11/22
//              if (period > -1){
                period = param.continuity[param.indicePrimoBreakPoint];
//              }
          }

        if (period > -1){
           ide=param.indicePrimoBreakPoint + numSeg - 1;
           var myStruct2 = num_gc_degreered2d_period(controlPoint, pointShape, param, ide);
       }else
           var myStruct2 = num_gc_degreered2d(controlPoint, pointShape, ide, param);

        param = _.cloneDeep(myStruct2.param);
        controlPoint = _.clone(myStruct2.controlPoint);
//GC 15/11/22
//        period = param.continuity[param.indicePrimoBreakPoint];
        if (period > -1){
          period = param.continuity[param.indicePrimoBreakPoint];
          controlPoint=reduce_controlpoint(controlPoint,period);
     }
        var DrStruct = compute_MDspline(controlPoint,pointShape,pointGcMeshNew,param);
        bs = _.clone(DrStruct.bs);
        fl = _.clone(DrStruct.fl);
        pointShape = _.clone(DrStruct.pointShape);
        paramd = _.cloneDeep(param);
//          redraw1(pointShape, controlPoint, period);
        redraw3(pointShape, period);
        appendInfo(paramd);
        inblock = false;
     }else{
        alert("Operation not permitted! Degree must be positive")
     }
      inblock = false;
      $('#modalBody').empty();
      return;
    });

    $('#insertBreakPoint').click(function(e){
        e.preventDefault();
//        var ibp = Math.trunc((idPoint + 1) / NUMBER_POINT);
//        console.log(ibp);
        var temp = [pointGcMeshNew[idPoint]];
        var period = param.continuity[param.indicePrimoBreakPoint];
        if (period > -1){
          var myStruct = num_gc_knotins2d_period_new(controlPoint, temp, param);
        }else
          var myStruct = num_gc_knotins2d(controlPoint, temp, param);

        param = _.cloneDeep(myStruct.param);
        controlPoint = _.clone(myStruct.controlPoint);

        pointGcMeshNew = gc_mesh_new(param, NUMBER_POINT);
        var DrStruct = compute_MDspline(controlPoint,pointShape,pointGcMeshNew,param);
        bs = _.clone(DrStruct.bs);
        fl = _.clone(DrStruct.fl);
        pointShape = _.clone(DrStruct.pointShape);
        paramd = _.cloneDeep(param);
        period = paramd.continuity[paramd.indicePrimoBreakPoint];
//          redraw1(pointShape, controlPoint, period);
        redraw3(pointShape, period);
        appendInfo(paramd);
        inblock = false;
        $('#modalBody').empty();
        return;
    });

}
