$('#clearCanvas').on('click',function(e){
    e.preventDefault();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(grid_flag==1)
      create_grid(gridx, gridy);
    bs = [];
    fl = [];
    pointShape = [];
    controlPoint = [];
    pointGcMeshNew = []; 
    IDpointCurve = - 1;
    IDelement = - 1;
    IDlinePoint = - 1;
    initButton = false;
    inblock = false;
    paramd = _.cloneDeep(param);
    $('#infoShape').empty();
    $('#modalBody').empty();
    $('#degreeContinuity').empty();
    resetFileInput('input1')
    resetFileInput('input2')
})

function MyClean(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(grid_flag==1)
      create_grid(gridx, gridy);
    bs = [];
    fl = [];
    pointShape = [];
    controlPoint = [];
    pointGcMeshNew = []; 
    IDpointCurve = - 1;
    IDelement = - 1;
    IDlinePoint = - 1;
    initButton = false;
    inblock = false;
    paramd = _.cloneDeep(param);
    $('#infoShape').empty();
    $('#modalBody').empty();
    $('#degreeContinuity').empty();
//    resetFileInput('input1')
//    resetFileInput('input2')
}

function resetFileInput(id)
{
var fld = document.getElementById(id);
fld.form.reset();
fld.focus();
}
