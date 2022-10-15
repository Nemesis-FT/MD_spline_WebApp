/**
 * window to view
 * Funzione che recupera le coordinate del mouse e le scala
 * @param  {Evento} evt     che viene passata dalla funzione chiamante
 * @return {Object} {x: Integer, y: Integer}    posizione corretta del mouse
 */
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;

    return {
        x: Math.round((evt.clientX - rect.left) * scaleX),
        y: Math.round((evt.clientY - rect.top) * scaleY)
    }
}
