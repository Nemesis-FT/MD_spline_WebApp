
$('input[name=isClosed]').on('change',function(e){
    if($('input[name=isClosed]:checked').val() == 'true'){
        $('#continuityValue').prop('disabled', true);
        $('#continuityValue').val(Number($('#degree').val()) - 1);
    }else{
        $('#continuityValue').prop('disabled', true);
        $('#continuityValue').val(-1);
    }
});


$('#degree').on('change',function(e){
    if(Number($(this).val()) == 0)
        alert('The degree must be > 0');
    else{
        $('#continuity').val($('#degree').val() - 1);
        if($('input[name=isClosed]:checked').val() == 'true'){
            $('#continuityValue').val($('#degree').val() - 1)
        }
    }
});

$('#continuityValue').on('change',function(e){
    if(Number($(this).val()) < 0){
        alert('The periodic continuity must be > - 1');
        $(this).val(Number($('#degree').val() - 1));
    }
});
