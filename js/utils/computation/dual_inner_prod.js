function dual_inner_prod(f,g){
   var k=f.length;
   var val=0.0;

    for (var i=0 ; i < k; i++){
        val= val + f[i] * g[i];
     }
    return val;
}
