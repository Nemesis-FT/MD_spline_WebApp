function zeros(r, c){
    var result = new Array();
    for(var i = 0 ; i < r ; i++){
        result[i] = new Array();
        for(var k = 0; k < c; k++){
            result[i][k] = 0;
        }
    }
    return result;
}
