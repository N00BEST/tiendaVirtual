$(document).ready(()=>{
	$('#boton').click((e)=>{
		console.log($(e.target).attr('id'));
	});
	console.log('Documento cargado');
});

var opt = 2;