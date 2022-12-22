//const NUMBER_POINT = 11;
const DuePI = 2 * Math.PI;
const DIGIT = 5;
const CONSTRAIN = 1; //nel caso curva aperta se =1 usa minimi quadrati vincolati, =0 non vincolati

var param = {
    degree: [],
    continuity: [],
    ampiezzaSegmenti: [1],
    estremoA: 0,
    estremoB: 0,
    breakPoint: [],
    indicePrimoBreakPoint: 0,
    indiceUltimoBreakPoint: 0,
    partizioneNodaleT: [],
    partizioneNodaleS: [],
    indiciPartizioneNodaleT: [],
    indiciPartizioneNodaleS: []
}

let project = new Project()


var NUMBER_POINT = Number($('#npoint').val());
var paramd;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var controlPoint = [];
var pointShape = [];
var pointGcMeshNew = [];
var IDpointCurve = -1;
var IDelement = -1;
var IDlinePoint = -1;
var bs = [];
var fl = [];
var initButton = false;
var inblock = false;
// Interaction mode. "draw" if drawing, "zoom" if zooming.
var mode = "draw"
// Dragging flag. If mouse is being dragged, its set to true
var dragging = false
// ZoomBox dictionary
var zoomBox = {x: {start: 0, end: 0}, y: {start: 0, end: 0}}
// Visualization offsets
var offsets = {x: 0, y: 0}
let renderList = []
let transform_multilayer = true
var gg = 0;
var gc_col = ["Blue", "Cyan", "Green", "Red", "Yellow", "Magenta", "Black"];
var gridx = [];
var gridy = [];
var ngridy = Number($('#gridR').val());
//var ngridy = 20;
var ngridx = 2 * ngridy;
var hx, hy;
var grid_flag = 0;
var si_cps = 1;
var pan = 0;

var vxmax = canvas.width - 10;
var vxmin = 10;
var vymax = canvas.height - 10;
var vymin = 10;

var wxmin = vxmin;
var wymin = vymin;
var wxmax = vxmax;
var wymax = vymax;

ctx.lineJoin = 'round';
canvas.addEventListener('mouseup', mouseUpFunction);
canvas.addEventListener('mousedown', mouseDownFunction);
canvas.addEventListener('mousemove', mouseMoveFunction);
addPath()
selectPath(0)
paramd = _.cloneDeep(project.paths[project.active_path].getParamd());


//prende in input un punto schermo (coord. viewport) e le
//trasforma in coordinate della griglia (grid)
function gridPoint(ipoint) {
    if (grid_flag == 1) {
        var ix = Math.trunc(0.5 + ipoint.x / hx);
        var iy = Math.trunc(0.5 + ipoint.y / hy);
        ipoint.x = gridx[ix];
        ipoint.y = gridy[iy];
    }
    return ipoint;
}

//click button destro sul canvas (che e' interno ad un elemento div)
//richiama appendOption se si e' precedentemente individuato con il
//mouse un break-point sulla curva
//inblock a true indica che siamo nel menu' di secondo livello e
//quindi disabilita il menu' di primo livello
canvas.oncontextmenu = function (e) {
    e.preventDefault();
    if (initButton) {
        if (IDpointCurve !== -1) {
            inblock = true;
            appendOption(IDpointCurve, paramd);
            IDpointCurve = -1;
        }
        if (IDelement != -1)
            IDelement = -1;
        return;
    } else {
//di qui ci passa solo la prima volta dopo aver cliccato su Clean,
//inseriti i CP iniziali e poi terminati con button destro
        initButton = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var isClosed = $('input[name=isClosed]:checked').val();
        paramd = _.cloneDeep(project.paths[project.active_path].getParamd());
        var degree = Number($('#degree').val());
        var continuity = Number($('#continuity').val());

        paramd.degree.push(degree);
        var period = $('#continuityValue').val();

        if (period > -1) {
            if (controlPoint.length < 3) {
                alert('You must insert at least 3');
                return;
            }

        } else {

            if (controlPoint.length < degree + 1) {
                alert('You must insert at least ' + (degree + 1) + ' points');
                return;
            }
        }

        if (grid_flag == 1)
            create_grid(gridx, gridy);

        NUMBER_POINT = Number($('#npoint').val());
        let myStruct = mainVD_MDspl_new(paramd, (Number(period) + Number(controlPoint.length) + 1), Number(period), degree, continuity, NUMBER_POINT);
        paramd = _.cloneDeep(myStruct.param);
        bs = myStruct.myStruct.bs;
        fl = myStruct.myStruct.fl;

        createPoint(controlPoint, 'black', Number(period));
        pointShape = calculateMatrixControl(bs, fl, controlPoint, pointShape, Number(period));
        createPoint(pointShape, 'green', Number(period));
        appendInfo(paramd);

        return false;
    }

}

function addPath(svg_data=null) {
    project.addPath(svg_data)
    initButton = false;
    project.createPathHtml("pathList")
    selectPath(project.id - 1)
}

function removePath() {
    if (project.paths.length < 2) {
        alert("One path must remain.")
        return;
    }

    let id
    try {
        id = project.paths[project.active_path - 1].id;
    } catch (e) {
        id = project.paths[project.active_path + 1].id;
    }
    project.popPath()
    project.createPathHtml("pathList")
    selectPath(id, true);
}

function selectPath(id, nosave = false, dontdraw = false) {
    // Salvataggio caratteristiche curva
    if (id === null || id === undefined) {
        return
    }
    if (!nosave) {
        try {
            project.paths[project.active_path].paramd = paramd;
            project.paths[project.active_path].controlPoint = controlPoint
            project.paths[project.active_path].pointShape = pointShape
            project.paths[project.active_path].IDlinePoint = IDlinePoint
            project.paths[project.active_path].IDpointCurve = IDpointCurve
            project.paths[project.active_path].IDelement = IDelement
            project.paths[project.active_path].fl = fl
            project.paths[project.active_path].bs = bs
        } catch (e) {
        }
    }
    // Caricamento caratteristiche curva selezionata
    paramd = project.selectPath(id).paramd
    controlPoint = project.paths[project.active_path].controlPoint
    pointShape = project.paths[project.active_path].pointShape
    IDlinePoint = project.paths[project.active_path].IDlinePoint
    IDpointCurve = project.paths[project.active_path].IDpointCurve
    IDelement = project.paths[project.active_path].IDelement
    fl = project.paths[project.active_path].fl
    bs = project.paths[project.active_path].bs

    //Draw della curva caricata
    if (!dontdraw) {
        multipleRender()
        //zoom(new Event("", undefined), dontdraw);
    }
    let current = document.getElementById("current_path")
    current.innerText = "Current path is #" + (id).toString();

    appendInfo(paramd)
    //redraw2(pointShape, controlPoint, IDlinePoint);
}

function movePathUp(id) {
    project.switchPath(id, true)
    project.createPathHtml("pathList")
}

function movePathDown(id) {
    project.switchPath(id, false)
    project.createPathHtml("pathList")
}

function setPathRenderList(e) {
    let input = document.getElementById("paths_render")
    if (input.value === "") {
        renderList = []
        return;
    }
    let ids_str = input.value.split(",")
    let ids = []
    for (let i = 0; i < ids_str.length; i++) {
        try {
            let id = parseInt(ids_str[i])
            ids.push(id)
            if (!project.pathExists(id)) {
                alert("Path id " + id + " does not exist.")
                return;
            }
        } catch (e) {
            alert("Input is not valid.")
            return;
        }
    }
    renderList = ids;
    multipleRender();
}

function multipleRender() {
    let active_path = project.paths[project.active_path]
    let active = project.active_path
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < project.paths.length; i++) {
        if (renderList.includes(project.paths[i].id)) {
            selectPath(project.paths[i].id, false, true)
            let e = new Event("", undefined);
            if (active === i) {
                var period = paramd.continuity[paramd.indicePrimoBreakPoint];
                redraw1(pointShape, controlPoint, period, false);
            } else {
                drawOnlyCurve(e, false);
            }

        }
    }
    selectPath(active_path.id, false, true)
}

function transform_switch() {
    transform_multilayer = !transform_multilayer;
}

/*

 */

function mouseUpFunction(e) {
    e.preventDefault();
    if (inblock) return
    if (mode === "draw") {
        if (IDelement !== -1) {
            IDelement = -1;
            pan = 0;
            return;
        }

        var rightclick;
        var e = window.event;
        if (e.which)
            rightclick = (e.which == 3);
        else if (e.button)
            rightclick = (e.button == 2);
        if (!rightclick) {
            if (!initButton) {
                var ipoint = getMousePos(e);
                ipoint = gridPoint(ipoint);
                createPoint(ipoint, 'black');
                controlPoint.push(ipoint);
            }
        }
    }
    if (mode === "zoom") {
        dragging = false
        mode = "draw"
        var coords = normalize_coords(e)
        zoomBox.x.end = coords.x
        zoomBox.y.end = coords.y
        if (zoomBox.x.end < zoomBox.x.start) {
            var tmp = zoomBox.x.end
            zoomBox.x.end = zoomBox.x.start
            zoomBox.x.start = tmp
        }
        if (zoomBox.y.end < zoomBox.y.start) {
            var tmp = zoomBox.y.end
            zoomBox.y.end = zoomBox.y.start
            zoomBox.y.start = tmp
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        panning({x: (zoomBox.x.end + zoomBox.x.start) / 2, y: (zoomBox.y.end + zoomBox.y.start) / 2}, false, false)
        zoom_selection()
        console.debug(zoomBox)
        var oldId = IDelement

        var period = paramd.continuity[paramd.indicePrimoBreakPoint];

        if (renderList.length !== 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            multipleRender()
        } else {
            redraw1(pointShape, controlPoint, period);
        }
    }
}

function normalize_coords(e) {
    let element = canvas, offsetX = 0, offsetY = 0, mx, my;
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }
    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
    return {x: mx, y: my};
}

function mouseDownFunction(e) {
    e.preventDefault();
    if (inblock) return;
    if (mode === "draw") {
        var degree = Number($('#degree').val());
        var continuity = Number($('#continuity').val());
        if (degree <= continuity) {
            alert('Attention the continuity is larger than degree');
            return;
        }
        IDelement = intersect(e, controlPoint);
        if (initButton) {
            IDpointCurve = intersect(e, pointShape);
        }
    }
    if (mode === "zoom") {
        dragging = true
        var coords = normalize_coords(e)
        zoomBox.x.start = coords.x
        zoomBox.y.start = coords.y
    }
}

function panning(ipoint, isPoint = true, useOffsets = false) {
    var dex, dey;
    if (isPoint) {
        dex = ipoint.x - controlPoint[IDelement].x;
        dey = ipoint.y - controlPoint[IDelement].y;
    } else {
        dex = -ipoint.x + canvas.width / 2
        dey = -ipoint.y + canvas.height / 2
    }

    let active = project.active_path

    for (let k = 0; k < project.paths.length; k++) {
        if (!transform_multilayer && project.paths[k].id !== project.paths[active].id) {
            continue;
        }
        selectPath(project.paths[k].id, false, true)
        for (var i = 0; i < controlPoint.length; i++) {
            controlPoint[i].x = controlPoint[i].x + dex;
            controlPoint[i].y = controlPoint[i].y + dey;
        }

        for (var i = 0; i < pointShape.length; i++) {
            pointShape[i].x = pointShape[i].x + dex;
            pointShape[i].y = pointShape[i].y + dey;
        }
    }
    selectPath(project.paths[active].id, false, true)
    //Ridisegno tutto
    var period = paramd.continuity[paramd.indicePrimoBreakPoint];
    redraw1(pointShape, controlPoint, period, true);
    if (renderList.length !== 0) {
        multipleRender()
    }
}

function mouseMoveFunction(e) {
    e.preventDefault();
    if (inblock) return;
    if (mode === "draw") {
        if (initButton) {
            IDlinePoint = intersect(e, pointShape);
            if (renderList.length !== 0) {
                multipleRender()
            } else if (IDlinePoint !== -1) {
                redraw2(pointShape, controlPoint, IDlinePoint, paramd.continuity[paramd.indicePrimoBreakPoint]);
            }

        }


        if (IDelement !== -1) {
            var ipoint = getMousePos(e);
            ipoint = gridPoint(ipoint);

            if (pan == 1) {
                panning(ipoint)
            } else {

//aggiorno la posizione dell'elemento in posizione IDelement
                controlPoint[IDelement] = ipoint;
//Ridisegno tutto
                var period = paramd.continuity[paramd.indicePrimoBreakPoint];
                var gcind = findSupport(paramd, IDelement);
                for (var i = 0; i < gcind.length; i++)
                    gcind[i] = gcind[i] * NUMBER_POINT;

//    pointShape = redraw(bs, fl, controlPoint, period);
                pointShape = redraw4(bs, controlPoint, pointShape, period, gcind);
                if (renderList.length !== 0) {
                    multipleRender()
                }
            }
        }
    }
    if (mode === "zoom") {
        if (dragging) {
            var coords = normalize_coords(e)
            zoomBox.x.end = coords.x
            zoomBox.y.end = coords.y
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (renderList.length !== 0) {
                multipleRender()
            } else {
                redraw1(pointShape, controlPoint, period);
            }
            ctx.fillStyle = "#000000"
            ctx.rect(zoomBox.x.start, zoomBox.y.start, zoomBox.x.end - zoomBox.x.start, zoomBox.y.end - zoomBox.y.start)
            ctx.stroke()

        }
    }
}

function panfun(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton)
        pan = 1 - pan;
}

function md_openFile(event) {
    event.preventDefault();
    var input = event.target;
    var numeroSegmenti = 0;
    var ampiezzaSegmenti = [];
    var degree = [];
    var continuity = [];
    var mcontrolPoint = [];
    var period = 0;
    var gcstr = [];
    var jj, ind = [];
    var reader = new FileReader();
    reader.onload = function () {

        MyClean();
        paramd = _.cloneDeep(project.active_path.getParamd());
        var text = reader.result;
        var arrayText = text.split("\n");
        for (var i = 0; i < arrayText.length; i++) {
            i++;
            if (arrayText[i].trim() == 'N.KNOT-INTERVALS') {
                i++;
                numeroSegmenti = Number(arrayText[i]);
                i++;
            }
            if (arrayText[i].trim() == 'KNOT-INTERVALS') {
                j = 0;
                for (var k = 0; k < numeroSegmenti; k++) {
                    ampiezzaSegmenti[j] = Number(arrayText[k + 1 + i]);
                    j++;
                }
                i = i + k + 1;
            }
            if (arrayText[i].trim() == 'DEGREES') {
                j = 0;
                i++;
                while (arrayText[i].trim() != 'CONTINUITY') {
                    degree[j] = Number(arrayText[i]);
                    j++;
                    i++;
                }
            }
            if (arrayText[i].trim() == 'CONTINUITY') {
                j = 0;
                i++;
                while (arrayText[i].trim() != 'PERIOD') {
                    continuity[j] = Number(arrayText[i]);
                    j++;
                    i++;
                }
            }
            if (arrayText[i].trim() == 'PERIOD') {
                i++;
                period = Number(arrayText[i]);
                i++;
            }
            i = i + 2;
            if (arrayText[i].trim() == 'COORD.C.P.(X,Y)') {
                i++;
                while (arrayText[i] != '') {
                    gcstr = arrayText[i].split(' ');
                    jj = 0;
                    for (var j = 0; j < gcstr.length; j++)
                        if (gcstr[j] !== '') {
                            ind[jj] = j;
                            jj++;
                        }
                    mcontrolPoint.push({'x': Number(gcstr[ind[0]]), 'y': Number(gcstr[ind[1]])});
                    i++;
                }
            }
            break;

        }

        paramd.ampiezzaSegmenti = ampiezzaSegmenti;
        paramd.degree = degree;
        paramd.continuity = continuity;
        controlPoint = mcontrolPoint;
        var temp = 0;
        for (var i = 0; i <= numeroSegmenti; i++) {
            temp = _.sum(paramd.ampiezzaSegmenti.slice(0, i));
            paramd.breakPoint[i] = temp;
        }

        paramd.estremoA = paramd.breakPoint[0];
        paramd.estremoB = paramd.breakPoint[i - 1];
        paramd.indicePrimoBreakPoint = 0;
        paramd.indiceUltimoBreakPoint = numeroSegmenti;

        paramd = isClosedShape(paramd, period);
        paramd = partizioniNodali(paramd);
        paramd.numeroControlPoint = controlPoint.length; //_.sum(param.degree.slice(0,param.numeroSegmenti)-param.continuity.slice(0, param.numeroSegmenti - 1))+param.degree[0] + 1;
        paramd.numeroBreakPoint = paramd.breakPoint.length - 1;

        initButton = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        NUMBER_POINT = Number($('#npoint').val());
        pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
        var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

        bs = myStruct.bs;
        fl = myStruct.fl;

        var Struct = wind_view(controlPoint);
        controlPoint = _.clone(Struct.controlPoint);

        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        pointShape = redraw(bs, fl, controlPoint, pointShape, period);
        appendInfo(paramd);
    }
    reader.readAsText(input.files[0]);
}

function path_openFile(data) {
    var numeroSegmenti = 0;
    var ampiezzaSegmenti = [];
    polydeg = [];
    var continuity = [];
    var gccont = [];
    var polyCP = [];
    var period = -1;
    var gcstr = [];
    var jj, ind = [];

    MyClean();
    paramd = _.cloneDeep(param);
    var polyStr = data;
    gck = 0;
    gccod = [];
    gcnum = [];
    var codec = 'mlhvcsqtaz';
    for (var i = 0; i < polyStr.length; i++) {
        res = polyStr.substr(i, 1);
        resL = res.toLowerCase();
        if (codec.indexOf(resL, 0) >= 0) {
            gccod[gck] = res;
            gcnum[gck] = i;
            gck = gck + 1;
        }
    }
    gcnum[gck] = polyStr.length + 1;
    fin = gccod.length;
    ipoint = [];
    ipoint[0] = 0;
    ipoint[1] = 0;
    nCP = 0;
    for (var i = 0; i < fin; i++) {
        res = polyStr.slice(gcnum[i] + 1, gcnum[i + 1]);
        res = res.trim();
        res = res.replace(/ /g, ",");
        res = res.replace(/,,/g, ",");
        arr = res.split(",");
//console.log(arr);
        polytemp = [];
        np = arr.length;
        for (var ii = 0; ii < np; ii++) {
            polytemp[ii] = Number(arr[ii]);
        }
        if (nCP > 0) {
            ipoint[0] = polyCP[nCP - 1].x;
            ipoint[1] = polyCP[nCP - 1].y;
        }
        switch (gccod[i]) {
            case 'M':
                polyCP.push({'x': polytemp[0], 'y': polytemp[1]});
                nCP++;
//console.log("M");
                break;
            case 'L':
                for (var ii = 1; ii <= np / 2; ii++) {
                    polydeg.push(1);
                    i1 = 2 * (ii - 1);
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
//                    polydeg.push(1);
//                    polyCP.push({'x':polytemp[0], 'y':polytemp[1]});
//                    nCP++;
//                    numeroSegmenti++;
//console.log("L");
                break;
            case 'm':
                polytemp[0] += ipoint[0];
                polytemp[1] += ipoint[1];
                polyCP.push({'x': polytemp[0], 'y': polytemp[1]});
                nCP++;
//console.log("m");
                break;
            case 'l':
                for (var ii = 1; ii <= np / 2; ii++) {
                    polydeg.push(1);
                    i1 = 2 * (ii - 1);
                    polytemp[i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    ipoint[0] = polytemp[i1];
                    ipoint[1] = polytemp[i1 + 1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
//                    polydeg.push(1);
//                    polytemp[0]+=ipoint[0];
//                    polytemp[1]+=ipoint[1];
//                    polyCP.push({'x':polytemp[0], 'y':polytemp[1]});
//                    nCP++;
//                    numeroSegmenti++;
                break;
            case 'H':
                for (var ii = 1; ii <= np; ii++) {
                    polydeg.push(1);
                    i1 = ii - 1;
                    polyCP.push({'x': polytemp[i1], 'y': polyCP[nCP - 1].y});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
//                    polydeg.push(1);
//                    polyCP.push({'x':polytemp[0], 'y':polyCP[nCP-1].y});
//                    nCP++;
//                    numeroSegmenti++;
//console.log("H");
                break;
            case 'h':
                for (var ii = 1; ii <= np; ii++) {
                    polydeg.push(1);
                    i1 = ii - 1;
                    polytemp[i1] += ipoint[0];
                    ipoint[0] = polytemp[i1];
                    ipoint[1] = polyCP[nCP - 1].y;
                    polyCP.push({'x': polytemp[i1], 'y': polyCP[nCP - 1].y});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
                break;
            case 'V':
                for (var ii = 1; ii <= np; ii++) {
                    polydeg.push(1);
                    i1 = ii - 1;
                    polyCP.push({'x': polyCP[nCP - 1].x, 'y': polytemp[i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
//console.log("V");
                break;
            case 'v':
                for (var ii = 1; ii <= np; ii++) {
                    polydeg.push(1);
                    i1 = ii - 1;
                    polytemp[i1] += ipoint[1];
                    ipoint[0] = polyCP[nCP - 1].x;
                    ipoint[1] = polytemp[i1];
                    polyCP.push({'x': polyCP[nCP - 1].x, 'y': polytemp[i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
                break;
            case 'C':
                for (var ii = 1; ii <= np / 6; ii++) {
                    polydeg.push(3);
                    i1 = 6 * (ii - 1);
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polyCP.push({'x': polytemp[++i1], 'y': polytemp[++i1]});
                    nCP++;
                    polyCP.push({'x': polytemp[++i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
                break;
            case 'c':
                for (var ii = 1; ii <= np / 6; ii++) {
                    polydeg.push(3);
                    i1 = 6 * (ii - 1);
                    polytemp[i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polytemp[++i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polytemp[++i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    ipoint[0] = polytemp[i1];
                    ipoint[1] = polytemp[i1 + 1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
                break;
            case 'S':
                for (var ii = 1; ii <= np / 4; ii++) {
                    polydeg.push(3);
//                        polyCP.push({'x':2*polyCP[nCP-1].x-polyCP[nCP-2].x, 'y':2*polyCP[nCP-1].y-polyCP[nCP-2].y});
//                        nCP++;
                    polyCP[nCP - 1].x = 2 * polyCP[nCP - 1].x - polyCP[nCP - 2].x;
                    polyCP[nCP - 1].y = 2 * polyCP[nCP - 1].y - polyCP[nCP - 2].y;
                    i1 = 4 * (ii - 1);
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polyCP.push({'x': polytemp[++i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 1;
                    numeroSegmenti++;
                }
                break;
            case 's':
                for (var ii = 1; ii <= np / 4; ii++) {
                    polydeg.push(3);
//                        polyCP.push({'x':2*polyCP[nCP-1].x-polyCP[nCP-2].x, 'y':2*polyCP[nCP-1].y-polyCP[nCP-2].y});
//                        nCP++;
                    polyCP[nCP - 1].x = 2 * polyCP[nCP - 1].x - polyCP[nCP - 2].x;
                    polyCP[nCP - 1].y = 2 * polyCP[nCP - 1].y - polyCP[nCP - 2].y;
                    i1 = 4 * (ii - 1);
                    polytemp[i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polytemp[++i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    ipoint[0] = polytemp[i1];
                    ipoint[1] = polytemp[i1 + 1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 1;
                    numeroSegmenti++;
                }
                break;
            case 'Q':
                for (var ii = 1; ii <= np / 4; ii++) {
                    polydeg.push(2);
                    i1 = 4 * (ii - 1);
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polyCP.push({'x': polytemp[++i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
//console.log("Q");
                break;
            case 'q':
                for (var ii = 1; ii <= np / 4; ii++) {
                    polydeg.push(2);
                    i1 = 4 * (ii - 1);
                    polytemp[i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    polytemp[++i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    ipoint[0] = polytemp[i1];
                    ipoint[1] = polytemp[i1 + 1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
                break;
            case 'T':
                for (var ii = 1; ii <= np / 2; ii++) {
                    polydeg.push(2);
//                        polyCP.push({'x':2*polyCP[nCP-1].x-polyCP[nCP-2].x, 'y':2*polyCP[nCP-1].y-polyCP[nCP-2].y});
//                        nCP++;
                    polyCP[nCP - 1].x = 2 * polyCP[nCP - 1].x - polyCP[nCP - 2].x;
                    polyCP[nCP - 1].y = 2 * polyCP[nCP - 1].y - polyCP[nCP - 2].y;
                    i1 = 2 * (ii - 1);
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 1;
                    numeroSegmenti++;
                }
//console.log("T");
                break;
            case 't':
                for (var ii = 1; ii <= np / 2; ii++) {
                    polydeg.push(2);
//                        polyCP.push({'x':2*polyCP[nCP-1].x-polyCP[nCP-2].x, 'y':2*polyCP[nCP-1].y-polyCP[nCP-2].y});
//                        nCP++;
                    polyCP[nCP - 1].x = 2 * polyCP[nCP - 1].x - polyCP[nCP - 2].x;
                    polyCP[nCP - 1].y = 2 * polyCP[nCP - 1].y - polyCP[nCP - 2].y;
                    i1 = 2 * (ii - 1);
                    polytemp[i1] += ipoint[0];
                    polytemp[i1 + 1] += ipoint[1];
                    ipoint[0] = polytemp[i1];
                    ipoint[1] = polytemp[i1 + 1];
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 1;
                    numeroSegmenti++;
                }
                break;
            case 'A':
//                  polytemp=str2num(polyStr(gcnum(i)+1:gcnum(i+1)-1));
//                  point=[polytemp(end-1);polytemp(end)];
//                  pp=SVGEllipticArc(polyCP(1,end),polyCP(2,end),point(1,1),point(2,1),...
//                      polytemp(1),polytemp(2),polytemp(3),polytemp(4),polytemp(5),20);
//                  polyCP=[polyCP,point];
                break;
            case 'a':
//                  polytemp=str2num(polyStr(gcnum(i)+1:gcnum(i+1)-1));
//                  point=[polytemp(end-1);polytemp(end)];
//                  point(1,1)=polyCP(1,end)+polytemp(end-1);
//                  point(2,1)=polyCP(2,end)+polytemp(end);
//                  pp=SVGEllipticArc(polyCP(1,end),polyCP(2,end),point(1,1),point(2,1),...
//                      polytemp(1),polytemp(2),polytemp(3),polytemp(4),polytemp(5),20);
//                  polyCP=[polyCP,point];
                break;
            case 'Z':
            case 'z': //GC 15/11/22 cambiato l'if, prima era =! e non veniva sentito TODO
                if (Math.abs(polyCP[0].x - polyCP[nCP - 1].x) > 0.001 || Math.abs(polyCP[0].y - polyCP[nCP - 1].y) > 0.001) {
                    polydeg.push(1);
//                        polyCP.push({'x':polyCP[0].x, 'y':polyCP[0].y});
//                        nCP++;
                    period = 0;
                    gccont[numeroSegmenti] = 0;
                    numeroSegmenti++;
                }
                break;
        }
    }
    for (var i = 0; i < numeroSegmenti; i++)
        ampiezzaSegmenti[i] = 1;
    paramd.ampiezzaSegmenti = ampiezzaSegmenti;
    paramd.degree = polydeg;
    for (var i = 0; i < numeroSegmenti - 1; i++) {
        continuity[i] = gccont[i + 1];
    }
    paramd.continuity = continuity;
    for (var i = 0; i < nCP; i++)
        controlPoint.push({'x': polyCP[i].x, 'y': polyCP[i].y});
    var temp = 0;
    for (var i = 0; i <= numeroSegmenti; i++) {
        temp = _.sum(paramd.ampiezzaSegmenti.slice(0, i));
        paramd.breakPoint[i] = temp;
    }
    paramd.estremoA = paramd.breakPoint[0];
    paramd.estremoB = paramd.breakPoint[i - 1];
    paramd.indicePrimoBreakPoint = 0;
    paramd.indiceUltimoBreakPoint = numeroSegmenti;
    paramd = isClosedShape(paramd, period);
    paramd = partizioniNodali(paramd);
    paramd.numeroControlPoint = controlPoint.length;
    paramd.numeroBreakPoint = paramd.breakPoint.length - 1;
    initButton = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    NUMBER_POINT = Number($('#npoint').val());
    pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
    var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);
    bs = myStruct.bs;
    fl = myStruct.fl;
    var Struct = wind_view(controlPoint);
    controlPoint = _.clone(Struct.controlPoint);
    var period = paramd.continuity[paramd.indicePrimoBreakPoint];
    pointShape = redraw(bs, fl, controlPoint, pointShape, period);
    appendInfo(paramd);
}


function md_saveFile(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        paramd.ampiezzaSegmenti = [1];
        var j = 0;
        for (var i = paramd.indicePrimoBreakPoint; i < paramd.indiceUltimoBreakPoint; i++) {
            paramd.ampiezzaSegmenti[j] = paramd.breakPoint[i + 1] - paramd.breakPoint[i];
            j = j + 1;
        }
        var file = '';
        file = "FILENAME newFile.md" + "\n";
        file += "N.KNOT-INTERVALS" + "\n";
        file += paramd.ampiezzaSegmenti.length + "\n";
        file += "KNOT-INTERVALS" + "\n";
        for (i = 0; i < paramd.ampiezzaSegmenti.length; i++) {
            file += paramd.ampiezzaSegmenti[i] + "\n";
        }

        file += "DEGREES" + "\n";

        for (i = paramd.indicePrimoBreakPoint; i < paramd.indiceUltimoBreakPoint; i++) {
            file += paramd.degree[i] + "\n";
        }

        file += "CONTINUITY" + "\n";
        for (i = paramd.indicePrimoBreakPoint + 1; i < paramd.indiceUltimoBreakPoint; i++) {
            file += paramd.continuity[i] + "\n";
        }

        file += "PERIOD" + "\n";
        file += paramd.continuity[paramd.indicePrimoBreakPoint] + "\n";
        file += "N.C.P." + "\n";
        file += controlPoint.length + "\n";

        file += "COORD.C.P.(X,Y)" + "\n";

        var ControlPointToSend = _.cloneDeep(controlPoint);
        ControlPointToSend = view_wind(ControlPointToSend);

        for (i = 0; i < ControlPointToSend.length; i++) {
            file += convert(ControlPointToSend[i].x.toFixed(DIGIT)) + " " + convert(ControlPointToSend[i].y.toFixed(DIGIT)) + "\n";
        }

        saveTextAs(file, "newFile.md");
    }
}

async function svg_saveFile(event) {
    let active = project.active_path;
    let dataset = []
    for (let i = 0; i < project.paths.length; i++) {
        selectPath(project.paths[i].id, false, true)
        dataset.push(path_saveFile(event))
    }
    let svg = await project.createSVG(dataset)
    selectPath(project.paths[active].id, false, true)
    saveTextAs(svg, "newFile.svg")
}

function svg_adaptor(path){
    // Sometimes SVGs are provided in a compressed format, which will not be understood by the parser.
    // This piece of code however relies on a external library. Not sure if this is allowed.
    try{
        let pathdata = path.getPathData({normalize: true})
        console.debug(pathdata)
        let d = ""
        let cmd = ""
        for(let i=0; i<pathdata.length; i++){
            cmd += pathdata[i].type + " "
            for(let k=0; k<pathdata[i].values.length; k++){
                cmd += pathdata[i].values[k]+" "
            }
            d += cmd
            cmd = ""
        }
        console.debug(d)
        return d;
    } catch (e) {
        return path.getAttribute("d")
    }

}

function svg_loadFile(event) {
    project = new Project()
    let reader = new FileReader()
    reader.onload = async function () {
        let text = reader.result;
        let parser, svgDoc;
        parser = new DOMParser()
        svgDoc = await parser.parseFromString(text, "image/svg+xml")
        project.setSvgSource(svgDoc)
        let paths = await svgDoc.querySelectorAll("path, ellipse, rect, circle, line, polyline, polygon")
        for (let i = 0; i < paths.length; i++) {
            let path = document.getElementById("pathbuffer")
            path = paths[i]
            addPath(paths[i])
            path_openFile(svg_adaptor(path))
        }
        calc_wminmax()
        selectPath(0, false, false)
    }
    reader.readAsText(event.target.files[0])
}

function path_saveFile(event) {
    event.preventDefault();
    let scale = 1
    if (inblock) return;

    if (initButton) {
        for (var i = paramd.indicePrimoBreakPoint; i < paramd.indiceUltimoBreakPoint; i++) {
            paramd.ampiezzaSegmenti[i] = paramd.breakPoint[i + 1] - paramd.breakPoint[i];
        }
        var flag;
        var file = '';
        var tt = [];

//controllo che i knot interval siano unitari (partizione uniforme)
        var i = 0;
        while (i < paramd.ampiezzaSegmenti.length && Math.abs(1 - paramd.ampiezzaSegmenti[i]) < 0.001) {
            i++;
        }
        if (i != paramd.ampiezzaSegmenti.length) {
            flag = 0;
            alert("Operation not permitted! It is not an SVG path: non-uniform partition.")
//        console.log("non e' un path SVG 1");
            return;
        } else
            flag = 1;

//controllo che tutti i tratti siano di grado <= 3
        var i = paramd.indicePrimoBreakPoint;
        while (i < paramd.indiceUltimoBreakPoint && paramd.degree[i] <= 3) {
            i++;
        }
        if (i != paramd.indiceUltimoBreakPoint) {
            flag = 0;
            alert("Operation not permitted! It is not an SVG path: segments of degree greater than 3.")
//        console.log("non e' un path SVG 2");
            return;
        } else
            flag = 1;

//se i due controlli precedenti sono passati, allora posso salvare la curva come un path SVG
        if (flag == 1) {
//preparo vettore da inserire (knot-insertion) per rappresentare la curva come C^0
            var j = 0;
            for (i = paramd.indicePrimoBreakPoint + 1; i < paramd.indiceUltimoBreakPoint; i++) {
                for (var ii = 0; ii < paramd.continuity[i]; ii++) {
                    tt[j] = paramd.breakPoint[i];
                    j++;
                }
            }
//se ci sono dei knot da inserire si entra in questo if
            if (j > 0) {
                var gc_param = _.cloneDeep(paramd, true);
                var gc_controlPoint = _.cloneDeep(controlPoint, true);
                var gc_period = paramd.continuity[paramd.indicePrimoBreakPoint];
                if (gc_period > -1)
                    var gcStruct = num_gc_knotins2d_period(gc_controlPoint, tt, gc_param);
                else
                    var gcStruct = num_gc_knotins2d(gc_controlPoint, tt, gc_param);

                var gcControlPoint = _.clone(gcStruct.controlPoint);
            } else
                var gcControlPoint = _.cloneDeep(controlPoint, true);

//trasformo i CP da coord. viewport a coord. window
            gcControlPoint = view_wind(gcControlPoint);
// console.log(gcControlPoint.length)
//li memorizzo in un file secondo la sintassi di un path SVG
            j = 0;
            file = "M " + convert(gcControlPoint[j].x.toFixed(DIGIT)) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT));
            j++;

            let cmd

            for (i = paramd.indicePrimoBreakPoint; i < paramd.indiceUltimoBreakPoint; i++) {
                cmd = ""
                try {
//console.log(paramd.indicePrimoBreakPoint, i, paramd.degree[i]);
                    switch (paramd.degree[i]) {
                        case 1:
                            cmd += " L " + convert(gcControlPoint[j].x.toFixed(DIGIT)*scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT)*scale);
                            j++;
                            break;
                        case 2:
                            if (i > paramd.indicePrimoBreakPoint && paramd.degree[i - 1] != 2) {
                                cmd += " Q " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                j++;
                                cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                j++;
                            } else {
                                if (i > paramd.indicePrimoBreakPoint && paramd.continuity[i] > 0) {
                                    j++;
                                    cmd += " T " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                } else {
                                    if (i == paramd.indicePrimoBreakPoint)
                                        file += " Q ";
                                    else
                                        cmd += " ";
                                    cmd += convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                    cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                }
                            }
                            break;
                        case 3:
                            if (i > paramd.indicePrimoBreakPoint && paramd.degree[i - 1] != 3) {
                                cmd += " C " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                j++;
                                cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                j++;
                                cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                j++;
                            } else {
                                if (i > paramd.indicePrimoBreakPoint && paramd.continuity[i] > 0) {
                                    j++;
                                    cmd += " S " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                    cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                } else {
                                    if (i === paramd.indicePrimoBreakPoint)
                                        cmd += " C ";
                                    else
                                        cmd += " ";
//            console.log(j)
                                    cmd += convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                    cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                    cmd += " " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
                                    j++;
                                }
                            }
                            break;
                    }
                    file += cmd;
                } catch (e) {
                    console.debug(e)
                    continue
                }
            }
            return file;
        }
    }
}

function wind_view(controlPoint) {
    var arrayX = [];
    var arrayY = [];
    for (var i = 0; i < controlPoint.length; i++) {
        arrayX.push(controlPoint[i].x);
        arrayY.push(controlPoint[i].y);
    }

    wxmin = _.min(arrayX);
    wymin = _.min(arrayY);
    wxmax = _.max(arrayX);
    wymax = _.max(arrayY);

    var scx = (vxmax - vxmin) / (wxmax - wxmin);
    var scy = (vymax - vymin) / (wymax - wymin);

    if (scx < scy) {
        scy = scx;
        var temp = (vymax - vymin) / scy;
        wymin = wymin - 0.5 * (temp - (wymax - wymin));
        wymax = wymax + 0.5 * (temp - (wymax - wymin));
    } else {
        scx = scy;
        var temp = (vxmax - vxmin) / scx;
        wxmin = wxmin - 0.5 * (temp - (wxmax - wxmin));
        wxmax = wxmax + 0.5 * (temp - (wxmax - wxmin));
    }

    for (var i = 0; i < controlPoint.length; i++) {
        // controlPoint[i].x = Math.trunc(0.5 + scx * (controlPoint[i].x - wxmin) + vxmin);
        // controlPoint[i].y = Math.trunc(0.5 + scy * (wymin - controlPoint[i].y) + vymax);
        controlPoint[i].x = scx * (controlPoint[i].x - wxmin) + vxmin;
        controlPoint[i].y = scy * (wymin - controlPoint[i].y) + vymax;
    }
    return {controlPoint: controlPoint};
}

function view_wind(myControlPointToSend) {
//converte i controlPoint da coord. viewport alle coordinate
//di una window [0,1]x[0,1]
    var arrayX = [];
    var arrayY = [];
    for (var i = 0; i < myControlPointToSend.length; i++) {
        arrayX.push(myControlPointToSend[i].x);
        arrayY.push(myControlPointToSend[i].y);
    }
    var gc_vxmin = vxmin;
    var gc_vxmax = vxmax;
    var gc_vymin = vymin;
    var gc_vymax = vymax;

    var scx = (vxmax - vxmin);
    var scy = (vymax - vymin);
    if (scx < scy) {
        scx = scy;
        gc_vxmin = vxmin - 0.5 * (scx - (vxmax - vxmin));
        gc_vxmax = vxmax + 0.5 * (scx - (vxmax - vxmin));
    } else {
        scy = scx;
        gc_vymin = vymin - 0.5 * (scy - (vymax - vymin));
        gc_vymax = vymax + 0.5 * (scy - (vymax - vymin));
    }
    for (i = 0; i < myControlPointToSend.length; i++) {
        myControlPointToSend[i].x = (myControlPointToSend[i].x - gc_vxmin) / scx;
        myControlPointToSend[i].y = (gc_vymax - myControlPointToSend[i].y) / scy;
    }
    return myControlPointToSend;
}

$("canvas").mousewheel(function (ev, val) {
    if (inblock) return;

    if (initButton) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = project.active_path;
        for (let i = 0; i < project.paths.length; i++) {
            if (!transform_multilayer && project.paths[i].id !== project.paths[active].id) {
                continue;
            }
            selectPath(project.paths[i].id, false, true)
            zoom_view(pointShape, controlPoint, val);
        }
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        selectPath(project.paths[active].id, false, true)
        if (renderList.length !== 0) {
            multipleRender()
        } else {
            redraw1(pointShape, controlPoint, period, false);
        }
    }
    return;
});

document.getElementById("canvas").onwheel = function (event) {
    event.preventDefault();
};

document.getElementById("canvas").onmousewheel = function (event) {
    event.preventDefault();
};

function gridfun(event) {

    event.preventDefault();
    grid_flag = 1 - grid_flag;
    if (grid_flag == 1) {
        ngridy = Number($('#gridR').val());
        ngridx = 2 * ngridy;
        hx = (vxmax - vxmin + 20) / (ngridx - 1);
        hy = (vymax - vymin + 20) / (ngridy - 1);
        for (var i = 0; i < ngridx; i++) {
            gridx[i] = vxmin - 10 + i * hx;
        }
        for (var i = 0; i < ngridy; i++) {
            gridy[i] = vymin - 10 + i * hy;
        }
    }
    create_grid(gridx, gridy);
    if (initButton) {
        redraw6(pointShape, controlPoint, paramd.continuity[paramd.indicePrimoBreakPoint]);
        if (renderList.length !== 0) {
            multipleRender()
        }
    }
}

function calc_wminmax(){
    var arrayX = [];
    var arrayY = [];
    for (let k = 0; k < project.paths.length; k++) {

        selectPath(project.paths[k].id, false, true)

        for (var i = 0; i < controlPoint.length; i++) {
            arrayX.push(controlPoint[i].x);
            arrayY.push(controlPoint[i].y);
        }
    }


    wxmin = _.min(arrayX);
    wymin = _.min(arrayY);
    wxmax = _.max(arrayX);
    wymax = _.max(arrayY);
}

function zoom(event, dontclear = false) {
    if (inblock) return;

    if (initButton) {

        let active = project.active_path
        var arrayX = [];
        var arrayY = [];
        for (let k = 0; k < project.paths.length; k++) {

            selectPath(project.paths[k].id, false, true)

            for (var i = 0; i < controlPoint.length; i++) {
                arrayX.push(controlPoint[i].x);
                arrayY.push(controlPoint[i].y);
            }
        }


        wxmin = _.min(arrayX);
        wymin = _.min(arrayY);
        wxmax = _.max(arrayX);
        wymax = _.max(arrayY);

        for (let k = 0; k < project.paths.length; k++) {
            selectPath(project.paths[k].id, false, true)
            zoom_view(pointShape, controlPoint, 0);
            var period = paramd.continuity[paramd.indicePrimoBreakPoint];
            redraw1(pointShape, controlPoint, period, !dontclear);
        }
        selectPath(project.paths[active].id, false, true)
    }
}

function zoomArea(event) {
    event.preventDefault()
    mode = "zoom"
}

function zoom_selection() {
    let vratio = (zoomBox.y.end - zoomBox.y.start) / canvas.height
    let active = project.active_path
    for (let i = 0; i < project.paths.length; i++) {
        if (!transform_multilayer && project.paths[i].id !== project.paths[active].id) {
            continue;
        }
        selectPath(project.paths[i].id, false, true)
        zoom_view(pointShape, controlPoint, -1, vratio)
    }
    selectPath(project.paths[active].id, false, true)
}

function zoom_view(pointShape, controlPoint, flagwheel, vscale = null) {
//applica uno zoom ai controlPoint per portarli a pieno schermo/canvas
//flagwheel e' >0 o <0 a seconda di come sto girando la rotella del mouse
    // Ci sono dei problemi...
    if (flagwheel !== 0) {
        if (flagwheel < 0)
            sc = 1.1;
        else
            sc = 0.9;
        if (vscale != null) {
            sc = vscale;
        }

        var cx = (wxmax + wxmin) / 2;
        var cy = (wymax + wymin) / 2;

        wxmin = sc * (wxmin - cx) + cx;
        wxmax = sc * (wxmax - cx) + cx;
        wymin = sc * (wymin - cy) + cy;
        wymax = sc * (wymax - cy) + cy;
    }

    var scx = (vxmax - vxmin) / (wxmax - wxmin);
    var scy = (vymax - vymin) / (wymax - wymin);

    if (scx < scy) {
        scy = scx;
        var temp = (vymax - vymin) / scy;
        wymin = wymin - 0.5 * (temp - (wymax - wymin));
        wymax = wymax + 0.5 * (temp - (wymax - wymin));
    } else {
        scx = scy;
        var temp = (vxmax - vxmin) / scx;
        wxmin = wxmin - 0.5 * (temp - (wxmax - wxmin));
        wxmax = wxmax + 0.5 * (temp - (wxmax - wxmin));
    }
//aggiorna controlPoint
    for (var i = 0; i < controlPoint.length; i++) {
        controlPoint[i].x = scx * (controlPoint[i].x - wxmin) + vxmin;
        controlPoint[i].y = scy * (controlPoint[i].y - wymin) + vymin;
    }
//aggiorna punti valutazione curva
    for (var i = 0; i < pointShape.length; i++) {
        pointShape[i].x = scx * (pointShape[i].x - wxmin) + vxmin;
        pointShape[i].y = scy * (pointShape[i].y - wymin) + vymin;
    }
//aggiorna estremi window a quelli della viewport
    wxmin = vxmin;
    wymin = vymin;
    wxmax = vxmax;
    wymax = vymax;
}

function drawMDBS(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var wxmin = paramd.estremoA;
        var wymin = 0.0;
        var wxmax = paramd.estremoB;
        var wymax = 1.0;

        var scx = (vxmax - vxmin) / (wxmax - wxmin);
        var scy = (vymax - vymin) / (wymax - wymin);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];

        pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
        var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

        bs = myStruct.bs;
        fl = myStruct.fl;
        var calculatedPoint = [];
        for (var i = 0; i < bs.length; i++) {
            calculatedPoint[i] = {x: 0, y: 0};
            calculatedPoint[i].x = scx * (pointGcMeshNew[i] - wxmin) + vxmin;
        }

        for (var j = 0; j < bs[0].length; j++) {
            for (var i = 0; i < bs.length; i++) {
                calculatedPoint[i].y = scy * (wymin - bs[i][j]) + vymax;
            }
            createPoint(calculatedPoint, gc_col[j % 7], -1);  //BS-spline function
        }
    }
}

function drawOnlyCurve(event, clear = true) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        // = 1 - si_cps;
        redraw3(pointShape, period, clear);
        /*if (si_cps === 1) {
            redraw6(pointShape, controlPoint, period, clear);
        } else {
            redraw3(pointShape, period, clear);
        }*/
    }
}

function drawInside(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        redraw5(pointShape, 'black');
    }
}

function upapprox(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var param_orig = _.cloneDeep(paramd);
        param_orig = partizioniNodali(param_orig);
        var np = 2 * param_orig.partizioneNodaleT.length;
        var numeroSegmenti = paramd.indiceUltimoBreakPoint - paramd.indicePrimoBreakPoint;
        var temp = (paramd.estremoB - paramd.estremoA) / numeroSegmenti;
        for (var i = 0; i < numeroSegmenti; i++)
            paramd.ampiezzaSegmenti[i] = temp;
        temp = 0;
        for (i = 0; i <= numeroSegmenti; i++) {
            temp = _.sum(paramd.ampiezzaSegmenti.slice(0, i));
            paramd.breakPoint[i] = temp;
        }
        var myStruct = num_gc_approx2d(controlPoint, pointShape, param_orig, paramd, np);
        paramd = _.cloneDeep(myStruct.param);
        var cpx = myStruct.cpx;
        var cpy = myStruct.cpy;
        for (i = 0; i < cpx.length; i++) {
            controlPoint[i] = {x: cpx[i], y: cpy[i]};
        }

//GC 11/08/2021
//aggiunte per rendere partizione nodale con intervalli unnitari
//e poter salvare la curva come SVG
        temp = 1.0;
        paramd.estremoA = 0;
        paramd.estremoB = numeroSegmenti;
        for (var i = 0; i < numeroSegmenti; i++)
            paramd.ampiezzaSegmenti[i] = temp;
        temp = 0;
        for (i = 0; i <= numeroSegmenti; i++) {
            temp = _.sum(paramd.ampiezzaSegmenti.slice(0, i));
            paramd.breakPoint[i] = temp;
        }
        paramd = partizioniNodali(paramd);
//GC 11/08/2021

        NUMBER_POINT = Number($('#npoint').val());

        pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
        var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

        bs = myStruct.bs;
        fl = myStruct.fl;

        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        pointShape = redraw(bs, fl, controlPoint, pointShape, period);
        appendInfo(paramd);
    }
}

//calcola il baricentro dei Control Point
function baricenter(controlPoint) {
    var arrayX = [];
    var arrayY = [];
    for (var i = 0; i < controlPoint.length; i++) {
        arrayX.push(controlPoint[i].x);
        arrayY.push(controlPoint[i].y);
    }
    var cx = 0.5 * (_.min(arrayX) + _.max(arrayX));
    var cy = 0.5 * (_.min(arrayY) + _.max(arrayY));
    return {cx: cx, cy: cy};
}

function rotate(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
//Ruota di 90 gradi in senso antiorario i CP rispetto al proprio baricentro e ridisegna
        let active = project.active_path;
        for (let k = 0; k < project.paths.length; k++) {
            if (!transform_multilayer && project.paths[k].id !== project.paths[active].id) {
                continue;
            }
            selectPath(project.paths[k].id, false, true)
            var bar = baricenter(controlPoint);
            var cx = bar.cx;
            var cy = bar.cy;
            var cc = Math.cos(Math.PI / 2);
            var ss = Math.sin(Math.PI / 2);
            var temp;
            for (var i = 0; i < controlPoint.length; i++) {
                temp = cc * controlPoint[i].x - ss * controlPoint[i].y - cc * cx + ss * cy + cx;
                controlPoint[i].y = ss * controlPoint[i].x + cc * controlPoint[i].y - ss * cx - cc * cy + cy;
                controlPoint[i].x = temp;
            }
            NUMBER_POINT = Number($('#npoint').val());

            pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
            var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

            bs = myStruct.bs;
            fl = myStruct.fl;

            var period = paramd.continuity[paramd.indicePrimoBreakPoint];
            pointShape = redraw(bs, fl, controlPoint, pointShape, period);
        }
        selectPath(project.paths[active].id, false, true)
        if (renderList.length !== 0) {
            multipleRender()
        } else {
            redraw1(pointShape, controlPoint, period, false);
        }
    }
}

function mirrorX(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
//Determina i CP simmetrici rispetto all'asse X per il proprio baricentro e ridisegna
        let active = project.active_path;
        for (let k = 0; k < project.paths.length; k++) {
            if (!transform_multilayer && project.paths[k].id !== project.paths[active].id) {
                continue;
            }
            selectPath(project.paths[k].id, false, true)
            var bar = baricenter(controlPoint);
            var cx = bar.cx;
            var cy = bar.cy;
            for (var i = 0; i < controlPoint.length; i++) {
                controlPoint[i].y = -controlPoint[i].y + 2 * cy;
            }
            NUMBER_POINT = Number($('#npoint').val());

            pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
            var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

            bs = myStruct.bs;
            fl = myStruct.fl;

            var period = paramd.continuity[paramd.indicePrimoBreakPoint];
            pointShape = redraw(bs, fl, controlPoint, pointShape, period);
        }
        selectPath(project.paths[active].id, false, true)
        if (renderList.length !== 0) {
            multipleRender()
        } else {
            redraw1(pointShape, controlPoint, period, false);
        }
    }
}

function mirrorY(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
//Determina i CP simmetrici rispetto all'asse Y per il proprio baricentro e ridisegna
        let active = project.active_path;
        for (let k = 0; k < project.paths.length; k++) {
            if (!transform_multilayer && project.paths[k].id !== project.paths[active].id) {
                continue;
            }
            selectPath(project.paths[k].id, false, true)
            var bar = baricenter(controlPoint);
            var cx = bar.cx;
            var cy = bar.cy;
            for (var i = 0; i < controlPoint.length; i++) {
                controlPoint[i].x = -controlPoint[i].x + 2 * cx;
            }
            NUMBER_POINT = Number($('#npoint').val());

            pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
            var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

            bs = myStruct.bs;
            fl = myStruct.fl;

            var period = paramd.continuity[paramd.indicePrimoBreakPoint];
            pointShape = redraw(bs, fl, controlPoint, pointShape, period);
        }
        selectPath(project.paths[active].id, false, true)
        if (renderList.length !== 0) {
            multipleRender()
        } else {
            redraw1(pointShape, controlPoint, period, false);
        }
    }
}

function periodToNoperiod(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        if (period > 0) {
            var temp = [];
            var nc = paramd.continuity[paramd.indicePrimoBreakPoint];
            for (var i = 0; i < nc; i++)
                temp.push(paramd.estremoA);
            nc = paramd.continuity[paramd.indiceUltimoBreakPoint];
            for (var i = 0; i < nc; i++)
                temp.push(paramd.estremoB);

            var gg = period + 1;
            for (var i = 0; i < gg; i++)
                controlPoint.push(controlPoint[i]);
            var myStruct = num_gc_knotins2d(controlPoint, temp, paramd);
        }
        param = _.cloneDeep(myStruct.param);
        controlPoint = _.clone(myStruct.controlPoint);

        if (period > -1) {
            period = param.continuity[param.indicePrimoBreakPoint];
            controlPoint = reduce_controlpoint(controlPoint, period);
        }

        var DrStruct = compute_MDspline(controlPoint, pointShape, pointGcMeshNew, param);
        bs = _.clone(DrStruct.bs);
        fl = _.clone(DrStruct.fl);
        paramd = _.cloneDeep(param);
        pointShape = _.clone(DrStruct.pointShape);
        period = paramd.continuity[paramd.indicePrimoBreakPoint];
//          redraw1(pointShape, controlPoint, period);
        redraw3(pointShape, period);
        appendInfo(paramd);
    }
}

//GC 15/11/22
//questa nuova function permette di aprire una curva chiusa C^0
function OpenCurve(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        if (period === 0) {
            paramd.breakPoint.shift();
            paramd.breakPoint.pop();
            paramd.degree.shift();
            paramd.degree.pop();
            paramd.continuity.shift();
            paramd.continuity.pop();
            paramd.continuity[0] = -1;
            paramd.continuity[paramd.breakPoint.length - 1] = -1;
            paramd.indicePrimoBreakPoint -= 1;
            paramd.indiceUltimoBreakPoint -= 1;

            paramd.numeroBreakPoint = paramd.breakPoint.length;
            let cPl = controlPoint.length;
            controlPoint.push({'x': controlPoint[0].x, 'y': controlPoint[0].y});
            paramd.numeroControlPoint = cPl + 1;
            paramd = partizioniNodali(paramd);

            NUMBER_POINT = Number($('#npoint').val());

            pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
            var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

            bs = myStruct.bs;
            fl = myStruct.fl;

            pointShape = redraw(bs, fl, controlPoint, pointShape, period);
            appendInfo(paramd);
        }
    }
}

//questa function è la opposta della precedente, ossia presa
//una curva aperta (period=-1) la chiude aggiungendo un tratto lineare
function CloseCurve(event) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        if (period === -1) {
            paramd.breakPoint.unshift(1);
            paramd.breakPoint[0] = paramd.breakPoint[1] - 1;
            paramd.breakPoint.push(paramd.breakPoint[paramd.breakPoint.length - 1] + 1);
            paramd.breakPoint.push(paramd.breakPoint[paramd.breakPoint.length - 1] + 1);
            paramd.degree.unshift(1);
            paramd.degree[0] = 1;
            paramd.degree.push(1);
            paramd.degree.push(paramd.degree[1]);
            paramd.continuity.unshift(1);
            paramd.continuity[0] = 0;
            paramd.continuity[1] = 0;
            paramd.continuity.push(0);
            paramd.continuity[paramd.continuity.length - 2] = 0;
            paramd.continuity.push(0);

            paramd.indicePrimoBreakPoint = 1;
            paramd.indiceUltimoBreakPoint += 2;
            paramd.estremoB = paramd.breakPoint[paramd.breakPoint.length - 2];

            paramd.numeroBreakPoint = paramd.breakPoint.length;
            paramd = partizioniNodali(paramd);


            NUMBER_POINT = Number($('#npoint').val());

            pointGcMeshNew = gc_mesh_new(paramd, NUMBER_POINT);
            var myStruct = gc_MDbspl_valder(paramd, pointGcMeshNew);

            bs = myStruct.bs;
            fl = myStruct.fl;

            period = paramd.continuity[paramd.indicePrimoBreakPoint];
            pointShape = redraw(bs, fl, controlPoint, pointShape, period);
            appendInfo(paramd);
        }
    }
}

function showInfoToggle() {
    let panel = document.getElementById("infoShape")
    if (panel.style.display === "none") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
}