$(document).ready(()=>{
	$("#nombre").on('change', checkNombre);
	$('#apellido').on('change', checkApellido);
	$('#correo').on('change', checkCorreo);
	$('#telefono').on('change', checkTelefono);
	$('#cedula').on('change', checkCedula);
	$('#pass').on('change', checkPass);
	$('#pass2').on('change', checkPass2);

	$('#submit').click(enviar);
});

var __NOMBRE = false;
var __APELLIDO = false;
var __CORREO = false;
var __TLF = true;
var __CEDULA = false;
var __PASS = false;
var __PASS2 = false;

function checkNombre(event){
	let nombre = $('#nombre').val();
	if(nombre.length === 0) {
		$('#nombre').removeClass('is-valid');
		$('#nombre').addClass('is-invalid');
		$('#alerta_nombre').text('El nombre no puede estar vacío.');
		__NOMBRE = false; 
	} else {
		$('#nombre').removeClass('is-invalid');
		$('#nombre').addClass('is-valid');
		$('#alerta_nombre').text('');
		__NOMBRE = true;
	}
}

function checkApellido(event){
	let apellido = $('#apellido').val();
	if(apellido.length === 0) {
		$('#apellido').removeClass('is-valid');
		$('#apellido').addClass('is-invalid');
		$('#alerta_apellido').text('El apellido no puede estar vacío.');
		__APELLIDO = false; 
	} else {
		$('#apellido').removeClass('is-invalid');
		$('#apellido').addClass('is-valid');
		$('#alerta_apellido').text('');
		__APELLIDO = true;
	}
}

function checkCorreo(event){
	let correo = $('#correo').val();
	let regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	if(correo.length === 0) {
		$('#correo').removeClass('is-valid');
		$('#correo').addClass('is-invalid');
		$('#alerta_correo').text('El correo no puede estar vacío.');
		__CORREO = false; 
	} else if(!regex.test(correo)) {
		$('#correo').removeClass('is-valid');
		$('#correo').addClass('is-invalid');
		$('#alerta_correo').text('El correo es inválido.');
		__CORREO = false;
	} else {
		$.get('/exists/' + correo).then((response)=>{
			if(response === 'false'){
				$('#correo').removeClass('is-invalid');
				$('#correo').addClass('is-valid');
				$('#alerta_correo').text('');
				__CORREO = true;
			} else if(response === 'true'){
				$('#correo').removeClass('is-valid');
				$('#correo').addClass('is-invalid');
				$('#alerta_correo').text('El correo ya está registrado.');
				__CORREO = false;
			} else {
				$('#correo').removeClass('is-invalid');
				$('#correo').removeClass('is-valid');
				$('#alerta_correo').text('');
			}
		}).catch((err)=>{
			$('#correo').removeClass('is-invalid');
			$('#correo').removeClass('is-valid');
			$('#alerta_correo').text('');
		})
	}
}

function checkTelefono(event){
	let regex = /^(\+)?\d{0,14}$/g;
	let tlf = $('#telefono').val();
	if(!regex.test(tlf)){
		$('#telefono').removeClass('is-valid');
		$('#telefono').addClass('is-invalid');
		$('#alerta_telefono').text('Ingrese sólo números en el formato indicado.');
		__TLF = false;
	} else {
		$('#telefono').removeClass('is-invalid');
		$('#telefono').addClass('is-valid');
		$('#alerta_telefono').text('');
		__TLF = false;
	}
}

function checkCedula(event){
	let regex = /^[VEJPG]\d{7,9}$/g;
	let cedula = $('#cedula').val();
	cedula = cedula.toUpperCase();
	$('#cedula').val(cedula);
	if(!regex.test(cedula)){
		let msg;
		if(cedula.length === 0){
			msg = 'La cédula no puede estar vacía.';
		} else if(!/[VEJPG]/.test(cedula.substr(0, 1))) {
			msg = 'Por favor, ingrese la cédula en el formato indicado.';
		} else {
			msg = 'El número de cédula es incorrecto.';
		}
		$('#cedula').removeClass('is-valid');
		$('#cedula').addClass('is-invalid');
		$('#alerta_cedula').text(msg);
		__CEDULA = false;
	} else {
		$.get('/exists/' + cedula).then((response)=>{
			if(response === 'false') {
				$('#cedula').removeClass('is-invalid');
				$('#cedula').addClass('is-valid');
				$('#alerta_cedula').text('');
				__CEDULA = true;
			} else if(response === 'true'){
				$('#cedula').removeClass('is-valid');
				$('#cedula').addClass('is-invalid');
				$('#alerta_cedula').text('La cédula ya está registrada.');
				__CEDULA = false;
			} else {
				$('#cedula').removeClass('is-valid');
				$('#cedula').removeClass('is-invalid');
				$('#alerta_cedula').text('');
			}
		}).catch((err)=>{
			$('#cedula').removeClass('is-valid');
			$('#cedula').removeClass('is-invalid');
			$('#alerta_cedula').text('');
		})
		
	}
}

function checkPass(event){
	let pw = $('#pass').val();
	if(!__PASS2){
		$('#pass2').val('');
		$('#pass2').removeClass('is-valid');
		$('#pass2').removeClass('is-invalid');
	}
	if(pw.length < 8) {
		$('#pass').removeClass('is-valid');
		$('#pass').addClass('is-invalid');
		$('#alerta_contraseña').text('La contraseña debe tener al menos 8 caracteres.');
		__PASS = false;
	} else if(pw.length > 20) {
		$('#pass').removeClass('is-valid');
		$('#pass').addClass('is-invalid');
		$('#alerta_contraseña').text('La contraseña no puede exceder los 20 caracteres.');
		__PASS = false;
	} else {
		$('#pass').removeClass('is-invalid');
		$('#pass').addClass('is-valid');
		$('#alerta_contraseña').text('');
		__PASS = true;
	}
}

function checkPass2(event){
	if(__PASS){
		let pw = $('#pass').val();
		let pw2 = $('#pass2').val();
		if(pw === pw2){
			$('#pass2').removeClass('is-invalid');
			$('#pass2').addClass('is-valid');
			$('#alerta_contraseña2').text('');
			__PASS2 = true;
		} else {
			$('#pass2').removeClass('is-valid');
			$('#pass2').addClass('is-invalid');
			$('#alerta_contraseña2').text('Las contraseñas no coinciden.');
			__PASS2 = false;
		}
	}
}

function enviar(event){
	checkApellido();
	checkCedula();
	checkCorreo();
	checkNombre();
	checkPass();
	checkPass2();
	if(__NOMBRE && __APELLIDO && __CEDULA && __CORREO && __TLF && __PASS && __PASS2){
		let user = {
			nombre: $('#nombre').val(),
			apellido: $('#apellido').val(),
			correo: $('#correo').val(),
			telefono: $('#telefono').val(),
			cedula: $('#cedula').val(),
			pass: $('#pass').val(),
			pass2: $('#pass2').val(),
			direccion: $('#direccion').val(),
			nacimiento: $('#nacimiento').val()
		}
		$.post('/Registrarse', user, (response)=>{
			switch(response){
				case 'success': 
					window.location.replace('/');
				break;

				case 'email':
					$('#notificacion').text('Error: El correo ya está registrado.');
				break;

				case 'passwords':
					$('#notificacion').text('Error: Las contraseñas no son iguales.');
				break; 

				case 'id':
					$('#notificacion').text('Error: La cédula ya está registrada.');
				break;

				default: 
					$('#notificacion').text('Error: No se pudo registrar al usuario.');
				break;
			}
		});
	} else {
		console.log('No se puede enviar el formulario');
	}
}