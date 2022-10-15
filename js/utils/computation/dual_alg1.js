function dual_alg1(n,bs,ds,c){


    var v = [];
    var u = [];
    for(var i = 0; i < n; i++){

        u[i] = dual_inner_prod(bs[n], ds[i]);
        v[i] = dual_inner_prod(bs[i], bs[n]);

    }

    v[n] = dual_inner_prod(bs[n], bs[n]);
    c[n] = (1 / (v[n] - (math.multiply(_.slice(u, 0, n ), _.slice(v,0,n )))));


    for(i = 0 ; i < n ; i++){
        c[i] =-(v[i] * c[n]);
    }

   var som = 0.0;

   for(var i = 0 ; i < n ; i++){
      if(i == 0){
         som = math.multiply((som + c[i]),ds[i]);
      }else{
            var temp = math.multiply( c[i] ,ds[i]);
            for(var k = 0 ; k < som.length; k++){
               som[k] = som[k] + temp[k] ;
            }

         }
   }


   var moltiplication = math.multiply(c[n], bs[n]);
   for(var my = 0 ; my < moltiplication.length ; my++){
      moltiplication[my] = moltiplication[my][0];
   }

   ds[n] = [];

   for(my = 0 ; my < moltiplication.length; my++){
      ds[n][my] = som[my] + moltiplication[my];
   }




   for(i =0 ; i < n ; i++){
      temp = math.multiply(u[i], ds[n]);

      for(var j = 0 ; j < temp.length; j++){
         ds[i][j] = ds[i][j] - temp[j]
      }
   }


   return ds;


}
