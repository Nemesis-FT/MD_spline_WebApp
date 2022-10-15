function intersect(e, arrayToSearch) {
    var mousePosition = getMousePos(e);
/*
    for (var i = 0; i < arrayToSearch.length; i++) {
        if (mousePosition.x < arrayToSearch[i].x + 10 && mousePosition.x > arrayToSearch[i].x - 10 && mousePosition.y < arrayToSearch[i].y + 10 && mousePosition.y > arrayToSearch[i].y - 10) {
            return i;
        }
    }
    return -1;
*/ 
  var arr_ret=-1;
  if(arrayToSearch.length !== 0){
    var mind=Math.sqrt(Math.pow(mousePosition.x-arrayToSearch[0].x,2)+Math.pow(mousePosition.y-arrayToSearch[0].y,2));
    var tempd;
    var gc_ind=[];
    var m=0;
    gc_ind[m]=0;

//alla fine di questo ciclo in gc_ind vengono memorizzati gli indici dei punti che hanno stessa
//distanza minima dalle coordinate del mouse; solitamente e' un indice, ma possono essere anche
//piu' di uno. Comunque al momento ritorna solo l'indice di uno di questi, il primo trovato
    for (var i = 1; i < arrayToSearch.length; i++) {
        tempd=Math.sqrt(Math.pow(mousePosition.x-arrayToSearch[i].x,2)+Math.pow(mousePosition.y-arrayToSearch[i].y,2));
        if (tempd <= mind) {
          if (tempd == mind)
            m++;
          else
            m=0;
          gc_ind[m]=i;
          mind=tempd;
      }
    }
//il valore 10 nella formula seguente indica una distanza in pixel accettabile per la selezione;
//infatti sia il vettore controlPoint che pointShape su cui si fa la ricerca memorizzano
//coordinate viewport date in pixel
    if (mind < 10)
       arr_ret=gc_ind[0];
  }

  return arr_ret;
}
