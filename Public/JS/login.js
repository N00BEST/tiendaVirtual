$(document).ready(()=>{
	$('#correo').on('change', checkCorreo);
	$('#submit').click(enviar);
	$('#form_MiniLogin').on('submit', enviar);
});

var __CORREO = false;

function checkCorreo(event){
	let correo = $('#correo').val();
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
		$.get('/exists/' + correo).then((response)=>{
			if(response === 'false'){
				$('#correo').addClass('is-invalid');
				$('#alerta_correo').text('El correo no está registrado.');
				__CORREO = false;
			} else if(response === 'true'){
				$('#correo').removeClass('is-invalid');
				$('#alerta_correo').text('');
				$('#notificacion').text('');
				__CORREO = true;
			} else {
				$('#correo').removeClass('is-invalid');
				$('#alerta_correo').text('');
			}
		}).catch((err)=>{
			$('#correo').removeClass('is-invalid');
			$('#alerta_correo').text('');
		})
	}
}

function enviar(){
	checkCorreo();
	if(__CORREO){
		$.post('/Login', {
			correo: $('#correo').val(),
			pass: $('#pass').val()
		}, (response)=>{
			window.location.href = response;
		}).catch((error)=>{
			switch(error.status){
				case 404:
					$('#notificacion').text('El correo no está registrado.');
				break;

				case 401:
					$('#notificacion').text('Contraseña incorrecta.');
				break;

				default:
					$('#notificacion').text('Ocurrió un error intentando iniciar sesión.');
				break;
			}
		});
	} else {
		$('#notificacion').text('El correo no está registrado.');
	}
}