$(document).ready(()=>{
	$('#correo').on('change', checkCorreo);
	$('#pass').on('change', limpiar);
	$('#form_Login').on('submit', submit);
	$('#submit').click(submit);
});

var __CORREO = false;

function submit(event){
	checkCorreo();
	if(__CORREO) {
		$.post('http://localhost:8000/admin/login', {
			correo: $('#correo').val(),
			pass: $('#pass').val()
		}, (response)=>{
			window.location.href = response;
		}).catch((err)=>{
			setTimeout(limpiar, 1000);
			switch(err.status) {
				case 400: 
					$('#correo').addClass('is-invalid');
					$('#alerta_correo').text('El correo es incorrecto o no existe');
				break;

				case 401: 
					$('#pass').addClass('is-invalid');
					$('#alerta_pass').text('La contraseña es incorrecta');
				break;

				default: 
					$('#notificacion').text('Ocurrió un error, por favor reintente más tarde.');
				break;
			}
		});
	}
}

function limpiar(event){
	$('#pass').removeClass('is-invalid');
	$('#correo').removeClass('is-invalid');
}

function checkCorreo(event){
	let correo = $('#correo').val();
	$('#alerta_pass').val('');
	$('#pass').removeClass('is-invalid');
	let regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	if(correo.length === 0) {
		$('#correo').addClass('is-invalid');
		$('#alerta_correo').text('');
		__CORREO = false; 
	} else if(!regex.test(correo)) {
		$('#correo').addClass('is-invalid');
		$('#alerta_correo').text('El correo es inválido.');
		__CORREO = false;
	} else {
		$('#correo').removeClass('is-invalid');
		$('#alerta_correo').text('');
		__CORREO = true;
	}
}