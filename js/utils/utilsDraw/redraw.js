//redraw chiama createPoint sia sui CPs che sulla curva 
function redraw(bs, fl, controlPoint, pointShape, period, strokeColor, fillColor){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(fill){
        fillPolygon(pointShape, fillColor);
    }

    var calculatedPoint = calculateMatrixControl(bs, fl, controlPoint, pointShape, period);
    if (si_cps == 1){
      createPoint(controlPoint,'black', period);  //control points
    }
    createPoint(calculatedPoint,strokeColor,period);  //curve points

    return calculatedPoint;

}

function redraw1(calculatedPoint, controlPoint, period, clear=true, strokeColor, fillColor){
    if(clear){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if(fill){
        fillPolygon(pointShape, fillColor);
    }

    if(controlPoint.length===0){
        return;
    }
    if (si_cps == 1){
       createPoint(controlPoint,'black', period);  //control points
    }
    createPoint(calculatedPoint,strokeColor,period);  //curve points

}

//redraw2  chiama createPoint sia sui CPs che sulla curva, ma in più
//disegna anche il punto della curva più vicino alla posizione del mouse
function redraw2(pointShape, controlPoint, idPoint, period, strokeColor, fillColor, clear=true){
    if(clear){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if(fill){
        fillPolygon(pointShape, fillColor);
    }

    if (si_cps == 1){
       createPoint(controlPoint, 'black', period);  //control points
    }
    createPoint(pointShape, strokeColor, period);   //curve points
    if ((idPoint % NUMBER_POINT == 0) || ((idPoint + 1) % NUMBER_POINT) == 0){
       createPoint(pointShape[idPoint], 'red', period); //break-point
//GC stampa per ogni posizione mouse vicino alla curvaDeg-Cont-Deg
//       var mycontinuity = Math.trunc((idPoint + 1) / NUMBER_POINT);
//       console.log('(Deg-Cont-Deg)=');
//       console.log(paramd.degree[mycontinuity + paramd.indicePrimoBreakPoint - 1],paramd.continuity[mycontinuity + paramd.indicePrimoBreakPoint],paramd.degree[mycontinuity + paramd.indicePrimoBreakPoint]);
//GC fine stampa
    }else{
       createPoint(pointShape[idPoint], 'yellow', period); //curve point
//GC stampa per ogni posizione mouse vicino alla curva Cont-Deg-Cont
//       var mycontinuity = Math.trunc((idPoint + 1) / NUMBER_POINT);
//       console.log('(Cont-Deg-Cont)=');
//       console.log(paramd.continuity[mycontinuity + paramd.indicePrimoBreakPoint],paramd.degree[mycontinuity + paramd.indicePrimoBreakPoint],paramd.continuity[mycontinuity + 1 + paramd.indicePrimoBreakPoint]);
//GC fine stampa
    }

}

//redraw3 chiama createPoint2 che disegna solo la curva e i break-point (NO i CPs)
function redraw3(calculatedPoint, period, clear=true, strokeColor, fillColor){
    if(clear){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if(fill){
        fillPolygon(pointShape, fillColor);
    }

    createPoint2(calculatedPoint,strokeColor,period);  //curve points

}

//redraw4 ridisegna tutto, ma prima ricalcola solo l'essenziale a seguito
//della modifica di un CP
function redraw4(bs, controlPoint, pointShape, period, ind, strokeColor, fillColor){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(fill){
        fillPolygon(pointShape, fillColor);
    }

    var calculatedPoint = calculateMatrixControl(bs, fl, controlPoint, pointShape, period, ind);
    if (si_cps == 1){
       createPoint(controlPoint,'black', period);  //control points
    }
    createPoint(calculatedPoint,strokeColor,period);  //curve points

    return calculatedPoint;

}

//redraw5 chiama fillPolygon che disegna la curva e la riempie (fill)
function redraw5(calculatedPoint, color){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fillPolygon(calculatedPoint, color);
}

//redraw6 ridisegna tutto senza ricalcolare nulla
function redraw6(pointShape, controlPoint, period, clear=true, strokeColor, fillColor){
    if(clear){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if(fill){
        fillPolygon(pointShape, fillColor);
    }


    if (si_cps == 1){
      createPoint(controlPoint, 'black', period);  //control points
    }
    createPoint(pointShape, strokeColor, period);   //curve points
    createPoint(pointShape[0], 'red', period); //break-point
}
