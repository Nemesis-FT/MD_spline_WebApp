function dual_alg2(bs){
    var m = bs.length;
    var n = bs[0].length;
    var ds =zeros(n , m);
    var c = zerosVector(n, 1);
    var temp = [];

    
    temp = miobs(bs,0);

    var val = dual_inner_prod(temp, temp);

    for(i = 0 ; i < temp.length; i++){
        ds[0][i] = temp[i] / val;
    }

    for(var k = 0 ; k < n - 1  ; k++){

        ds = dual_alg1(k + 1 , miobscumul(bs, k + 1), miodscumul(ds,k),c);

    }
    return ds;
}


function miodscumul(matrix, index){
    if(index == 0){
        return [matrix[0]];
    }
    var result = [];
    for(var colonna = 0; colonna <= index; colonna++){
        result[colonna] = [];
        result[colonna] = matrix[colonna];
    }
    return result;
}


function miobs(matrix, colonna){
    var result = [];
    for(var riga = 0 ; riga < matrix.length ; riga++ ){
        result.push(matrix[riga][colonna])
    }
    return result;
}

function miobscumul(matrix, colonne){

    var result = [];
    for(var i = 0 ; i <= colonne; i++){
        result[i] = (miobs(matrix, i));
    }
    return result;

}

function zerosVector(r, c){
    var result = new Array();
    for(var i = 0 ; i < r ; i++ ){
        result.push(0);
    }
    return result;
}
