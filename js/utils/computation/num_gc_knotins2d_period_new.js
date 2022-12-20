function num_gc_knotins2d_period_new(controlPoint, tc, param){

    var period = param.continuity[param.indicePrimoBreakPoint];
    tc = update_array_period(tc,param);
    // console.log(temp);
    // console.log(controlPoint.length);
    var gg = period + 1;
    for(var i = 0; i < gg; i++)
        controlPoint.push(controlPoint[i]);
    var myStruct = num_gc_knotins2d(controlPoint, tc, param);

    param = _.cloneDeep(myStruct.param);
    controlPoint = _.clone(myStruct.controlPoint);

    period = param.continuity[param.indicePrimoBreakPoint];
    controlPoint=reduce_controlpoint(controlPoint,period);

    return {'param': param, 'controlPoint': controlPoint};

}

function reduce_controlpoint(controlPoint,period){

    var mycontrolPoint = [];
    
    for (var i = 0; i < controlPoint.length-period-1; i++){
       mycontrolPoint[i] = {x:controlPoint[i].x , y:controlPoint[i].y};
    }
  return mycontrolPoint
}

function update_array_period(tc,param){

    var tc_new = [];
    var ntc = tc.length;
    var a = param.estremoA;
    var b = param.estremoB;
    var x0 = param.breakPoint[0];
    var xn = param.breakPoint[param.breakPoint.length-1];
  
    tc=tc.sort(function(a,b){return a-b});
  
    for (var i = 0; i < ntc; i++){
       if (a-(b-tc[i]) > x0){
         tc_new.push(a-(b-tc[i]));
       }     
    }
    for (var i = 0; i < ntc; i++){
        tc_new.push(tc[i]);   
    }
    for (var i = ntc-1; i >= 0; i--){
      if (b+(tc[i]-a) < xn){
        tc_new.push(b+(tc[i]-a));
      }     
    }
  return tc_new;
  }