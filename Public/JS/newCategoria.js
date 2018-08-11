$(document).ready(()=>{
	$('#nombre').on('change', checkNombre);
	$('#imagen').on('change', checkImagen);
	$('#form_NuevaCategoria').on('submit', submit);
	DesplegarCategorias();
});

var __NOMBRE = false;
var __IMAGEN = true;

function checkNombre(event) {
	let nombre = $('#nombre').val();
	if(nombre.length > 0){
		$('#nombre').removeClass('is-invalid');
		$('#alerta_nombre').text('');
		__NOMBRE = true;
	} else {
		$('#nombre').addClass('is-invalid');
		$('#alerta_nombre').text('El nombre no puede estar vacío.');
		__NOMBRE = false;
	}
}

function checkImagen(event) {
	let imagen = $('#imagen')[0].files[0];

	if(typeof imagen !== 'undefined'){
		$('#notificacionImagen').text(imagen.name);
		if(imagen.size > 1 * 1000000){
			$('#alerta_imagen').text('Error: La imagen es demasiado pesada. El límite es 1 MB');
			__IMAGEN = false;
		} else {
			if(!/(jpeg|jpg|png|gif)/i.test(imagen.type)){
				$('#alerta_imagen').text('Error: Sólo puede subir imágenes.');
				__IMAGEN = false;
			} else {
				$('#alerta_imagen').text('');
				__IMAGEN = true;
			}
		}
	}
}

function submit(event) {
	checkNombre();
	checkImagen();
	if(!(__NOMBRE)) {
		event.preventDefault();
		$('#notificacion').empty(); 
		$('#notificacion').addClass('alert-danger'); 
		$('#notificacion').text('El nombre no puede estar vacío.');
		$(window).scrollTop(0);
	} else if(!__IMAGEN) {
		event.preventDefault();
		$('#notificacion').empty(); 
		$('#notificacion').addClass('alert-danger'); 
		$('#notificacion').text('Hay problemas con la imagen que intenta subir.');
		$(window).scrollTop(0);
	}
}