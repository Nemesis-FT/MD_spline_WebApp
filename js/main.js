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

let fillTransparency = false
let borderTransparency = false

let active_path = 0
var NUMBER_POINT = Number($('#npoint').val());
var paramd;
var canvas = document.getElementById('canvas');
let project = new Project()

function resize() {

    let parent = canvas.parentNode
    let styles = getComputedStyle(parent)
    let w = parseInt(styles.getPropertyValue("width"), 10)
    let h = parseInt(styles.getPropertyValue("height"), 10)
    canvas.width = w - 10
    canvas.height = h
    if (project.paths.length === 0) {

    }
    else{
        try{
            multipleRender()
        }
        catch (e) {
            
        }
        if(grid_flag){
            gridfun(new Event("test"), true)
        }
    }
}

$(window).on("resize", resize);
resize()
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
let fill = false
let strokeColorInput = document.getElementById("strokeCol")
let fillColorInput = document.getElementById("fillCol")

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

/**
 * Takes as input a screen point (viewport coordinates) and transforms them in grid coordinates.
 * @param ipoint
 * @returns {*}
 */
function gridPoint(ipoint) {
    if (grid_flag === 1) {
        var ix = Math.trunc(0.5 + ipoint.x / hx);
        var iy = Math.trunc(0.5 + ipoint.y / hy);
        ipoint.x = gridx[ix];
        ipoint.y = gridy[iy];
    }
    return ipoint;
}

/**
 * Upon rightclick on canvas, appendOption is then called if a breakpoint was selected on the spline.
 * The "inblock" variable is used to go to a deeper level in the menus.
 * @param e an event
 * @returns {boolean}:
 */
canvas.oncontextmenu = function (e) {
    e.preventDefault();
    if (initButton) {
        if (IDpointCurve !== -1) {
            inblock = true;
            appendOption(IDpointCurve, paramd);
            IDpointCurve = -1;
            $("#cpModal").modal()
        }
        if (IDelement !== -1)
            IDelement = -1;
        return;
    } else {
        //di qui ci passa solo la prima volta dopo aver cliccato su Clean,
        //inseriti i CP iniziali e poi terminati con button destro
        initButton = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paramd = _.cloneDeep(project.paths[project.active_path].getParamd());
        var degree = Number($('#degree').val());
        var continuity = Number($('#continuity').val());

        paramd.degree.push(degree);
        var period = $('#continuityValue').val();

        if (period > -1) {
            if (controlPoint.length < 3) {
                controlPoint = []
                initButton = false;
                alert('You must insert at least 3');
                return;
            }

        } else {
            if (controlPoint.length < degree + 1) {
                controlPoint = []
                initButton = false;
                alert('You must insert at least ' + (degree + 1) + ' points');
                return;
            }
        }

        if (grid_flag === 1)
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

/**
 * Function that adds a path to the project.
 * @param svg_data the original svg representation - if present.
 */
function addPath(svg_data = null) {
    project.addPath(svg_data, NUMBER_POINT)
    initButton = false;
    project.createPathHtml("pathList")
    selectPath(project.id - 1)
}

/**
 * Function that removes the selected path from the project.
 */
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

/**
 * Function that is used to select the active path among the ones inside the project.
 * In order to minimize the number of structural changes, the project.paths array is used as a main repository.
 * When a new path needs to be loaded, the internal structures are filled up with the corresponding data, stored inside
 * the structure.
 * @param id the id of the selected path
 * @param nosave boolean that enables (or disables) backing up the path data to the project structure
 * @param dontdraw boolean that enables (or disables) curve redrawing.
 */
function selectPath(id, nosave = false, dontdraw = false) {
    if (id === null || id === undefined) {
        return
    }
    if (!nosave) {
        try {
            // Curve back-up
            project.paths[project.active_path].paramd = paramd;
            project.paths[project.active_path].controlPoint = controlPoint
            project.paths[project.active_path].pointShape = pointShape
            project.paths[project.active_path].IDlinePoint = IDlinePoint
            project.paths[project.active_path].IDpointCurve = IDpointCurve
            project.paths[project.active_path].IDelement = IDelement
            project.paths[project.active_path].fl = fl
            project.paths[project.active_path].bs = bs
            project.paths[project.active_path].numberPoints = NUMBER_POINT
            project.paths[project.active_path].fillTransparent = fillTransparency
            project.paths[project.active_path].borderTransparent = borderTransparency
        } catch (e) {
        }
    }
    // Selected curve data loading
    paramd = project.selectPath(id).paramd
    controlPoint = project.paths[project.active_path].controlPoint
    pointShape = project.paths[project.active_path].pointShape
    IDlinePoint = project.paths[project.active_path].IDlinePoint
    IDpointCurve = project.paths[project.active_path].IDpointCurve
    IDelement = project.paths[project.active_path].IDelement
    fl = project.paths[project.active_path].fl
    bs = project.paths[project.active_path].bs
    NUMBER_POINT = project.paths[project.active_path].numberPoints
    borderTransparency = project.paths[project.active_path].borderTransparent
    fillTransparency = project.paths[project.active_path].fillTransparent
    npoints = document.getElementById("npoint")
    npoints.value = NUMBER_POINT
    document.getElementById("fill_transparency").checked = !fillTransparency
    document.getElementById("border_transparency").checked = !borderTransparency
    if(!nosave){
        active_path = project.active_path
    }
    if (project.paths[project.active_path].strokeColor) {
        strokeColorInput.value = project.paths[project.active_path].strokeColor.slice(0, 7)
    } else {
        strokeColorInput.value = "#000000"
    }
    if (project.paths[project.active_path].fillColor) {
        fillColorInput.value = project.paths[project.active_path].fillColor.slice(0, 7)
    } else {
        fillColorInput.value = "#000000"
    }


    //Draw of the curves
    if (!dontdraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        multipleRender()
    }
    // Update paths info
    let current = document.getElementById("current_path")
    current.innerText = "Current path is #" + (id).toString();
    // Display current path data
    appendInfo(paramd)
}

/**
 * Moves a path up in the paths stack.
 * @param id the id of the path that needs to be swapped.
 */
function movePathUp(id) {
    project.switchPath(id, true)
    project.createPathHtml("pathList")
    selectPath(id, true, false)
    let current = document.getElementById("current_path")
    current.innerText = "Current path is #" + (id).toString();
}

/**
 * Moves a path down in the paths stack.
 * @param id the id of the path that needs to be swapped.
 */
function movePathDown(id) {
    project.switchPath(id, false)
    project.createPathHtml("pathList")
    selectPath(id, true, false)
    let current = document.getElementById("current_path")
    current.innerText = "Current path is #" + (id).toString();
}

/**
 * Sets the list of paths to be rendered, reading from the "paths_render" widget.
 */
function setPathRenderList() {
    let input = document.getElementById("paths_render")
    if (input.value === "") {
        renderList = []
        return;
    }
    let ids = []
    if (input.value === "*") {
        for (let i = 0; i < project.paths.length; i++) {
            ids.push(project.paths[i].id)
        }
    }
    else{
        let ids_str = input.value.split(",")
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
    }
    renderList = ids;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    multipleRender();
}

/**
 * Render multiple paths in a single go
 */
function multipleRender(ignore_active=false) {
    let active_path = project.paths[project.active_path]
    let active = project.active_path
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < project.paths.length; i++) {

        if (active === i && !ignore_active) {
            selectPath(project.paths[i].id, false, true)
            var period = paramd.continuity[paramd.indicePrimoBreakPoint];
            redraw1(pointShape, controlPoint, period, false, "green", "transparent");
        }
        else if (renderList.includes(project.paths[i].id) && active != i) {
            ctx.strokeStyle = "black"
            selectPath(project.paths[i].id, false, true)
            let e = new Event("", undefined);
            drawOnlyCurve(e, false);
        }

    }
    selectPath(active_path.id, false, true)
}

/**
 * Enables/Disables multilayer transformations
 */
function transform_switch() {
    transform_multilayer = !transform_multilayer;
}

/**
 * Function that handles mouseup buttons events
 * @param e
 */
function mouseUpFunction(e) {
    e.preventDefault();
    if (inblock) return
    // Create points if in draw mode
    if (mode === "draw") {
        if (IDelement !== -1) {
            IDelement = -1;
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
    // Zoom on target box if drawn (pan and zoom)
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

        //redraw1(pointShape, controlPoint, period, true, "green", "black");
        multipleRender()
    }
}

/**
 * Normalize coordinates
 * @param e
 * @returns {{x: number, y: number}}
 */
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

/**
 * Function that handles mousedown events.
 * @param e
 */
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
    // Start zoom box coordinates
    if (mode === "zoom") {
        dragging = true
        var coords = normalize_coords(e)
        zoomBox.x.start = coords.x
        zoomBox.y.start = coords.y
    }
}

/**
 * Pan the view using a starting point.
 * @param ipoint
 * @param isPoint
 * @param useOffsets
 */
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
    //redraw1(pointShape, controlPoint, period, true, "green", "black");
    multipleRender()
}

/**
 * Toggles/untoggles shape filling
 * @param e
 */
function toggleFill(e) {
    fill = !fill
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //redraw1(pointShape, controlPoint, paramd.continuity[paramd.indicePrimoBreakPoint], true, "green", "black");
    multipleRender();
}

/**
 * Handles mouse move event
 * @param e
 */
function mouseMoveFunction(e) {
    e.preventDefault();
    if (inblock) return;
    if (mode === "draw") {
        if (initButton) {
            IDlinePoint = intersect(e, pointShape);
            if (IDlinePoint !== -1 && project.active_path == active_path) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                redraw2(pointShape, controlPoint, IDlinePoint, paramd.continuity[paramd.indicePrimoBreakPoint], "green", "black");
                multipleRender(true)
            }

        }
        if (IDelement !== -1) {
            var ipoint = getMousePos(e);
            ipoint = gridPoint(ipoint);
            if (pan) {
                panning(ipoint)
            } else {
                //aggiorno la posizione dell'elemento in posizione IDelement
                controlPoint[IDelement] = ipoint;
                //Ridisegno tutto
                var period = paramd.continuity[paramd.indicePrimoBreakPoint];
                var gcind = findSupport(paramd, IDelement);
                for (var i = 0; i < gcind.length; i++)
                    gcind[i] = gcind[i] * NUMBER_POINT;

                //pointShape = redraw(bs, fl, controlPoint, period);
                pointShape = redraw4(bs, controlPoint, pointShape, period, gcind, "green", "transparent");
                multipleRender(true)
            }
        }
    }
    // Draw the zoombox
    if (mode === "zoom") {
        if (dragging) {
            var coords = normalize_coords(e)
            zoomBox.x.end = coords.x
            zoomBox.y.end = coords.y
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //redraw1(pointShape, controlPoint, period, true, "green", "black");
            multipleRender()
            ctx.fillStyle = "#000000"
            ctx.strokeStyle = "#000000"
            ctx.rect(zoomBox.x.start, zoomBox.y.start, zoomBox.x.end - zoomBox.x.start, zoomBox.y.end - zoomBox.y.start)
            ctx.stroke()
            let zoombutton = document.getElementById("areaZoomButton")
            zoombutton.className = "btn btn-success"
        }
    }
}

function setEvalPoints(){
    value = document.getElementById("npoint").value
    NUMBER_POINT = Number(value)
    paramd = _.cloneDeep(project.paths[project.active_path].getParamd());
    var degree = Number($('#degree').val());
    var continuity = Number($('#continuity').val());

    paramd.degree.push(degree);
    var period = $('#continuityValue').val();

    if (grid_flag === 1)
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    multipleRender()
}

/**
 * Function that enables (or disables) the panning function.
 * @param event
 */
function panfun(event) {
    event.preventDefault();
    let button = document.getElementById("panButton")
    if (inblock) return;

    if (initButton)
        pan = !pan;
    if (pan) {
        button.className = "btn btn-warning"
    } else {
        button.className = "btn btn-success"
    }
}

/**
 * Function used to open the .md proprietary file type.
 * @param event
 */
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
        paramd = _.cloneDeep(paramd);
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
        pointShape = redraw(bs, fl, controlPoint, pointShape, period, project.paths[project.active_path].strokeColor, project.paths[project.active_path].fillColor);
        appendInfo(paramd);
    }
    reader.readAsText(input.files[0]);
}

/**
 * Function used to parse the contents of a path data string.
 * @param data the pathdata
 * @param offsets offsets used if the previous path used a 'm' command.
 */
function path_openFile(data, offsets = null) {
    var numeroSegmenti = 0;
    var ampiezzaSegmenti = [];
    let polydeg = [];
    var continuity = [];
    var gccont = [];
    var polyCP = [];
    var period = -1;
    var gcstr = [];
    var jj, ind = [];

    MyClean();
    paramd = _.cloneDeep(param);
    var polyStr = data;
    let gck = 0;
    let gccod = [];
    let gcnum = [];
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
    let fin = gccod.length;
    let ipoint = [];
    ipoint[0] = 0;
    ipoint[1] = 0;
    let nCP = 0;
    let early_exit = false
    let selected_path = project.active_path
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
        if (offsets != null) {
            // Import di offset provenienti da una curva con moveto relativi
            if (polytemp.length < 2) {
                polytemp.push(offsets[0])
                polytemp.push(offsets[1])
            } else {
                polytemp[0] = offsets[0]
                polytemp[1] = offsets[1]
            }
            offsets = null
        }
        if (nCP > 0) {
            ipoint[0] = polyCP[nCP - 1].x;
            ipoint[1] = polyCP[nCP - 1].y;
        }
        switch (gccod[i]) {
            case 'M':
                if (i !== 0) {
                    // If a moveto command is found, the path parsing is interrupted. A new path gets created, and recursively parsed.
                    let svg = project.paths[project.active_path].svgSource
                    let tmp = document.createElement("path")
                    tmp.setAttribute("d", data.slice(gcnum[i], data.length))
                    tmp.setAttribute("id", svg.getAttribute("id") + project.id)
                    tmp.setAttribute("fill", svg.getAttribute("fill"))
                    tmp.setAttribute("stroke", svg.getAttribute("stroke"))
                    addPath(tmp)
                    path_openFile(data.slice(gcnum[i], data.length))
                    early_exit = true
                } else {
                    polyCP.push({'x': polytemp[0], 'y': polytemp[1]});
                    nCP++;
                }
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
                break;
            case 'm':
                if (i !== 0) {
                    let svg = project.paths[project.active_path].svgSource
                    let tmp = document.createElement("path")
                    tmp.setAttribute("d", data.slice(gcnum[i], data.length))
                    tmp.setAttribute("id", svg.getAttribute("id") + project.id)
                    tmp.setAttribute("fill", svg.getAttribute("fill"))
                    tmp.setAttribute("stroke", svg.getAttribute("stroke"))
                    addPath(tmp)
                    path_openFile(data.slice(gcnum[i], data.length), [polytemp[0] + ipoint[0], polytemp[1] + ipoint[1]])
                    early_exit = true
                } else {
                    polyCP.push({'x': polytemp[0], 'y': polytemp[1]});
                    nCP++;
                }
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
                    polyCP[nCP - 1].x = 2 * polyCP[nCP - 1].x - polyCP[nCP - 2].x;
                    polyCP[nCP - 1].y = 2 * polyCP[nCP - 1].y - polyCP[nCP - 2].y;
                    i1 = 2 * (ii - 1);
                    polyCP.push({'x': polytemp[i1], 'y': polytemp[++i1]});
                    nCP++;
                    gccont[numeroSegmenti] = 1;
                    numeroSegmenti++;
                }
                break;
            case 't':
                for (var ii = 1; ii <= np / 2; ii++) {
                    polydeg.push(2);
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
        if (early_exit) {
            // Early exit function, used if a moveto command was detected.
            gcnum = gcnum.slice(0, i)
            gccod = gccod.slice(0, i)
            gck = i;
            data = data.slice(0, gcnum[gcnum.length])
            console.debug(data)
            break;
        }
    }
    // Fill in the data
    selectPath(project.paths[selected_path].id)
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
    pointShape = redraw(bs, fl, controlPoint, pointShape, period, project.paths[project.active_path].strokeColor, project.paths[project.active_path].fillColor);
    try {
        appendInfo(paramd);
    } catch (e) {

    }

}

/**
 * Save a single path in the proprietary .md format
 * @param event
 */
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

/**
 * Save a whole SVG file
 * @param event
 * @returns {Promise<void>} the promised svg file.
 */
async function svg_saveFile(event) {
    zoom_whole(event)
    let active = project.active_path;
    let dataset = []
    for (let i = 0; i < project.paths.length; i++) {
        selectPath(project.paths[i].id, false, true)

        dataset.push(path_saveFile(event))
    }
    let data = calc_wminmax()
    console.debug(data)
    project.viewbox = data
    let svg = await project.createSVG(dataset)
    selectPath(project.paths[active].id, false, true)
    await saveTextAs(svg, "newFile.svg")
}

/**
 * Convert the compressed SVG path syntax in a standard one and translate shapes into paths.
 * @param path the path
 * @returns {string} the normalized string
 */
function svg_adaptor(path) {
    // Sometimes SVGs are provided in a compressed format, which will not be understood by the parser.
    try {
        let pathdata = path.getPathData({normalize: true})
        console.debug(pathdata)
        let d = ""
        let cmd = ""
        for (let i = 0; i < pathdata.length; i++) {
            cmd += pathdata[i].type + " "
            for (let k = 0; k < pathdata[i].values.length; k++) {
                cmd += pathdata[i].values[k] + " "
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

// Toggle per chiusura modale del menu tasto sinistro
$('#cpModal').on('hidden.bs.modal', function () {
    inblock = false;
    $('#modalBody').empty();
});

function removeAllPaths(){
    project = new Project()
    addPath()
    selectPath(0)
}

/**
 * Load a whole SVG file
 * @param event
 */
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
            // Each path is temporarely loaded in the "pathbuffer" element, to then get parsed.
            let path = document.getElementById("pathbuffer")
            path = paths[i]
            addPath(paths[i])
            path_openFile(svg_adaptor(path))
        }
        let data = calc_wminmax()
        console.debug(data)
        project.viewbox = data
        selectPath(0, false, false)
        let input = document.getElementById("paths_render")
        input.value = "*"
        if (fill === false) {
            toggleFill(event)
        }
        setPathRenderList()
        zoom_whole(event)
    }
    reader.readAsText(event.target.files[0])
}

/**
 * Path data saving routine, converts internal representation to a svg path data
 * @param event
 * @returns {string} the path data
 */
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
            //li memorizzo in un file secondo la sintassi di un path SVG
            j = 0;
            file = "M " + convert(gcControlPoint[j].x.toFixed(DIGIT)) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT));
            j++;

            let cmd

            for (i = paramd.indicePrimoBreakPoint; i < paramd.indiceUltimoBreakPoint; i++) {
                cmd = ""
                try {
                    switch (paramd.degree[i]) {
                        case 1:
                            cmd += " L " + convert(gcControlPoint[j].x.toFixed(DIGIT) * scale) + " " + convert(gcControlPoint[j].y.toFixed(DIGIT) * scale);
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

/**
 * This function is responsable for a major headache. It caused major issues, but now its inoffensive.
 * @param controlPoint
 * @returns {{controlPoint}}
 */
function wind_view(controlPoint) {
    return {controlPoint: controlPoint};
    /*
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
    */
}
/**
 * This function is responsable for a major headache. It caused major issues, but now its inoffensive.
 * @param myControlPointToSend
 * @returns {{myControlPointToSend}}
 */
function view_wind(myControlPointToSend) {
    return myControlPointToSend
    /*
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
    */
}

/**
 * Mousewheel handler, allows zooming.
 */
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
        //redraw1(pointShape, controlPoint, period, false, "green", "black");
        multipleRender()
    }
    return;
});

document.getElementById("canvas").onwheel = function (event) {
    event.preventDefault();
};

document.getElementById("canvas").onmousewheel = function (event) {
    event.preventDefault();
};

/**
 * Draws a grid.
 * @param event
 */
function gridfun(event, notoggle=false) {

    event.preventDefault();
    if(!notoggle){
        grid_flag = 1 - grid_flag;
    }

    gridx = []
    gridy = []
    vxmax = canvas.width - 10;
    vxmin = 10;
    vymax = canvas.height - 10;
    vymin = 10;
    if (grid_flag == 1) {
        ngridy = Number($('#gridR').val());
        ratio = Math.abs(canvas.width/canvas.height)
        console.debug(ratio)
        ngridx = ngridy*1.5;
        console.debug(Math.floor(ngridx), ngridy)
        hx = (vxmax - vxmin + 20) / (ngridx-1);
        hy = (vymax - vymin + 20) / (ngridy-1);
        for (var i = 0; i < ngridx; i++) {
            gridx[i] = vxmin - 10 + i * hx;
        }
        for (var i = 0; i < ngridy; i++) {
            gridy[i] = vymin - 10 + i * hy;
        }
    }
    create_grid(gridx, gridy);
    if (initButton) {
        //redraw6(pointShape, controlPoint, paramd.continuity[paramd.indicePrimoBreakPoint], "green", "black");
        multipleRender()
    }
}

/**
 * Calculates bounding box of drawing.
 * @returns {{ymin: *, xmin: *, ymax: *, xmax: *}}
 */
function calc_wminmax() {
    var arrayX = [];
    var arrayY = [];
    for (let k = 0; k < project.paths.length; k++) {

        selectPath(project.paths[k].id, false, true)

        for (var i = 0; i < controlPoint.length; i++) {
            arrayX.push(controlPoint[i].x);
            arrayY.push(controlPoint[i].y);
        }
    }


    let wxmin = _.min(arrayX);
    let wymin = _.min(arrayY);
    let wxmax = _.max(arrayX);
    let wymax = _.max(arrayY);
    return {xmax: wxmax, xmin: wxmin, ymax: wymax, ymin: wymin}
}

function findBounds(points) {
    var n = points.length
    if(n === 0) {
        return []
    }
    var d = points[0].length
    var lo = points[0].slice()
    var hi = points[0].slice()
    for(var i=1; i<n; ++i) {
        var p = points[i]
        for(var j=0; j<d; ++j) {
            var x = p[j]
            lo[j] = Math.min(lo[j], x)
            hi[j] = Math.max(hi[j], x)
        }
    }
    return [lo, hi]
}

function zoom_whole(event){
    if (inblock) return;

    if (initButton) {
        let active = project.active_path
        let pts = []
        for(let k=0; k<project.paths.length; k++){
            selectPath(project.paths[k].id, false, true)
            for(let i=0; i<controlPoint.length; i++){
                pts.push([controlPoint[i].x, controlPoint[i].y])
            }
        }
        selectPath(project.paths[active].id, false, true)

        // Bounding box calculation
        let result = findBounds(pts)

        console.debug(result)

        ctx.rect(result[0][0], result[0][1], result[1][0]-result[0][0], result[1][1]-result[0][1])
        ctx.stroke()
        zoomBox.x.start = result[0][0]
        zoomBox.y.start = result[0][1]
        zoomBox.x.end = result[1][0]
        zoomBox.y.end = result[1][1]
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //redraw1(pointShape, controlPoint, period, true, "green", "black");
        multipleRender()

    }
}


/**
 * Zoom function
 * @param event
 * @param dontclear clear (or not) the screen
 */
function zoom(event, dontclear = false) {
    if (inblock) return;

    if (initButton) {
        let active = project.active_path
        let pts = []
        for(let i=0; i<controlPoint.length; i++){
            pts.push([controlPoint[i].x, controlPoint[i].y])
        }
        // Bounding box calculation
        let result = findBounds(pts)

        console.debug(result)

        ctx.rect(result[0][0], result[0][1], result[1][0]-result[0][0], result[1][1]-result[0][1])
        ctx.stroke()
        zoomBox.x.start = result[0][0]
        zoomBox.y.start = result[0][1]
        zoomBox.x.end = result[1][0]
        zoomBox.y.end = result[1][1]
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //redraw1(pointShape, controlPoint, period, true, "green", "black");
        multipleRender()

    }
}

/**
 * Enters "zoom" mode (allows area zooming)
 * @param event
 */
function zoomArea(event) {
    event.preventDefault()
    if (pan) {
        return;
    }
    mode = "zoom"
    let zoombutton = document.getElementById("areaZoomButton")
    zoombutton.className = "btn btn-warning"
}

/**
 * Zoom on area function
 */
function zoom_selection() {
    let vratio = (zoomBox.y.end - zoomBox.y.start) / canvas.height
    let hratio = (zoomBox.x.end - zoomBox.x.start) / canvas.width
    console.debug(vratio, hratio)
    let ratio;
    if (vratio<hratio){
        ratio = hratio;
    }
    else{
        ratio = vratio;
    }
    let active = project.active_path
    for (let i = 0; i < project.paths.length; i++) {
        if (!transform_multilayer && project.paths[i].id !== project.paths[active].id) {
            continue;
        }
        selectPath(project.paths[i].id, false, true)
        zoom_view(pointShape, controlPoint, -1, ratio)
    }
    selectPath(project.paths[active].id, false, true)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Zooms view based on scrollwheel
 * @param pointShape
 * @param controlPoint
 * @param flagwheel
 * @param vscale
 */
function zoom_view(pointShape, controlPoint, flagwheel, vscale = null) {
    //applica uno zoom ai controlPoint per portarli a pieno schermo/canvas
    //flagwheel e' >0 o <0 a seconda di come sto girando la rotella del mouse
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

/**
 * Sets line color.
 * @param event
 */
function setStrokeColor(event) {
    project.paths[project.active_path].strokeColor = event.target.value
    //redraw6(pointShape, controlPoint, paramd.continuity[paramd.indicePrimoBreakPoint], "green", "black");
    multipleRender()
}
/**
 * Sets filling color.
 * @param event
 */
function setFillColor(event) {
    project.paths[project.active_path].fillColor = event.target.value
    //redraw6(pointShape, controlPoint, paramd.continuity[paramd.indicePrimoBreakPoint], "green", "true");
    multipleRender()
}

/**
 * Hides controlpoints
 * @param event
 * @param clear
 */
function drawOnlyCurve(event, clear = true) {
    event.preventDefault();
    if (inblock) return;

    if (initButton) {
        var period = paramd.continuity[paramd.indicePrimoBreakPoint];
        // = 1 - si_cps;
        redraw3(pointShape, period, clear, ((borderTransparency) ? "transparent" : project.paths[project.active_path].strokeColor), ((fillTransparency) ? "transparent" : project.paths[project.active_path].fillColor));
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

/**
 * UPApproximation function.
 * @param event
 */
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
        pointShape = redraw(bs, fl, controlPoint, pointShape, period, "green", "black");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        multipleRender()
        appendInfo(paramd);
    }
}

/**
 * Calculates point baricenter
 * @param controlPoint
 * @returns {{cx: number, cy: number}}
 */
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

/**
 * Rotates path
 * @param event
 */
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
            pointShape = redraw(bs, fl, controlPoint, pointShape, period, "green", "black");
        }
        selectPath(project.paths[active].id, false, true)
        //redraw1(pointShape, controlPoint, period, true, "green", "black");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        multipleRender()
    }
}

/**
 * Mirror on the X axis
 * @param event
 */
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
            pointShape = redraw(bs, fl, controlPoint, pointShape, period, "green", "black");
        }
        selectPath(project.paths[active].id, false, true)
        //redraw1(pointShape, controlPoint, period, true, "green", "black");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        multipleRender()
    }
}

/**
 * Mirror on the Y axis
 * @param event
 */
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
            pointShape = redraw(bs, fl, controlPoint, pointShape, period, "green", "black");
        }
        selectPath(project.paths[active].id, false, true)
        //redraw1(pointShape, controlPoint, period, true, "green", "black");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        multipleRender()
    }
}

/**
 * Converts a curve to a non-periodic version
 * @param event
 */
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
        redraw3(pointShape, period, "green", "black");
        appendInfo(paramd);
    }
}

/**
 * Opens up a curve
 * @param event
 * @constructor
 */
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

            pointShape = redraw(bs, fl, controlPoint, pointShape, period, "green", "black");
            appendInfo(paramd);
        }
    }
}

/**
 * Closes a curve with a straight line
 * @param event
 * @constructor
 */
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
            pointShape = redraw(bs, fl, controlPoint, pointShape, period, "green", "black");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            multipleRender()
            appendInfo(paramd);
        }
    }
}

function transparency(type, event){
    if(type === "fill"){
        fillTransparency = !event.target.checked
    }
    else{
        borderTransparency = !event.target.checked
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