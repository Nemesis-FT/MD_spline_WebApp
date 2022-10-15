function createPoint(position, color, period){
const PCP=7;
    if(position.length == undefined){ 
// se c'e' solo un punto e non un array di punti dobbiamo gestire come 
// caso particolare
        ctx.beginPath();
        ctx.fillStyle = color;
        if (color !== 'black'){
            ctx.arc(position.x, position.y, 3, 0, 2 * DuePI, false);
        }else{
            ctx.arc(position.x, position.y, PCP, 0, 2 * DuePI, false);
        }
        ctx.fill();
        ctx.stroke();
        }
    else{ 
// nel caso che sia un array di punti (control-point o punti curva)
// disegnamo la spezzata
                ctx.strokeStyle=color;
                ctx.strokeWidth="2";
                for(var i = 0; i < position.length - 1; i++){
                    ctx.beginPath();
                    ctx.moveTo(position[i].x, position[i].y);
                    ctx.lineTo(position[i + 1].x, position[i + 1].y);
                    ctx.stroke();
                }
// la chiudiamo nel caso periodico                
                if(period > - 1){
                    ctx.beginPath();
                    ctx.moveTo(position[i].x, position[i].y);
                    ctx.lineTo(position[0].x, position[0].y);
                    ctx.stroke();
                }
//a seconda del colore con cui si entra si disegnano i punti come cerchi colorati
//piu' o meno grandi 
//          if(period > - 1 && color !== 'black' && color !== 'yellow' && color !=='red'){
// primo punto nel caso di curva chiusa
          if(color !== 'black' && color !== 'yellow' && color !=='red'){
// primo punto della curva
                ctx.beginPath();
                ctx.fillStyle = 'red';
                ctx.arc(position[0].x, position[0].y, PCP, 0, 2 * DuePI, false);
                ctx.fill();
                ctx.stroke();
            }
// poi gli altri punti
            for(var i = 0 ; i < position.length; i++){
                ctx.beginPath();
                if (color !== 'black'){
                    if(i % NUMBER_POINT == 0 && (i !== 0 || period > -1)){
                        ctx.fillStyle = 'white';
                        ctx.arc(position[i].x, position[i].y, 5, 0, 2 * DuePI, false);
//         ctx.arc(position[i].x, position[i].y, 3, 0, 2 * DuePI, false);
                    }
                }else {
// control point che vengono passati con color black
                    ctx.fillStyle = 'black';
                    ctx.arc(position[i].x, position[i].y, PCP, 0, 2 * DuePI, false);
                }
                ctx.fill();
                ctx.stroke();
           }
     }

   }


function createPoint2(position, color, period){ 
// nel caso che sia un array di punti (control-point o punti curva)
// disegnamo la spezzata
                ctx.strokeStyle=color;
                ctx.strokeWidth="2";
                for(var i = 0; i < position.length - 1; i++){
                    ctx.beginPath();
                    ctx.moveTo(position[i].x, position[i].y);
                    ctx.lineTo(position[i + 1].x, position[i + 1].y);
                    ctx.stroke();
                }
// la chiudiamo nel caso periodico                
                if(period > - 1){
                    ctx.beginPath();
                    ctx.moveTo(position[i].x, position[i].y);
                    ctx.lineTo(position[0].x, position[0].y);
                    ctx.stroke();
                }

            for(var i = 0 ; i < position.length; i++){
                ctx.beginPath();
                if (color !== 'black'){
                    if(i % NUMBER_POINT == 0 && (i !== 0 || period > -1)){
                        ctx.fillStyle = 'white';
                        ctx.arc(position[i].x, position[i].y, 2, 0, 2 * DuePI, false);
//            ctx.arc(position[i].x, position[i].y, 3, 0, 2 * DuePI, false);
                    }
                }else {
// control point che vengono passati con color black
                    ctx.fillStyle = 'black';
                    ctx.arc(position[i].x, position[i].y, PCP, 0, 2 * DuePI, false);
                }
                ctx.fill();
                ctx.stroke();

           }
}

function fillPolygon(points, color) {
        if (points.length > 0) {
            ctx.fillStyle = color; // all css colors are accepted by this property

            var point = points[0];
          
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);   // point 1
            
            for (var i = 1; i < points.length; ++i) {
                point = points[i];
              
                ctx.lineTo(point.x, point.y);
            }
// go back to point 1            
            ctx.closePath();      
            ctx.fill();
        }
    }

function create_grid(grid, color) {
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       if (grid_flag == 1) {
            var nx = ngridx-1;
            var ny = ngridy-1;
            ctx.strokeStyle = 'grey'; // all css colors are accepted by this property
         
            ctx.beginPath();
            
            for (var i = 0; i < ngridx; i++) {              
                ctx.moveTo(gridx[i], gridy[0]-10);   // point 1
                ctx.lineTo(gridx[i], gridy[ny]+10);
            }
            for (var i = 0; i < ngridy; i++) {              
                ctx.moveTo(gridx[0]-10, gridy[i]);   // point 1
                ctx.lineTo(gridx[nx]+10, gridy[i]);
            }
// go back to point 1           
            ctx.closePath();      
            ctx.stroke();
      }
}