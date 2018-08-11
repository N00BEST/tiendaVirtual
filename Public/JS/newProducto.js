$(document).ready(()=>{
	$('#form_NuevoProducto').on('submit', submit);
	$('#codigo').on('change', checkCodigo);
	$('#nombre').on('change', checkNombre);
	$('#precio').on('change', checkPrecio);
	$('#cantidad').on('change', checkCantidad);
	$('#visibilidad').on('change', checkVisibilidad);
	$('#imagen').on('change', checkImagen);
	$('#descuento').on('change', checkDescuento);
	$('#submit').on('click', submit);
});

var __CODIGO = false;
var __NOMBRE = false;
var __PRECIO = true;
var __CANTIDAD = true;
var __DESCUENTO = true;
var __IMAGEN = true;

function submit(event) {
	checkCodigo();
	checkNombre();
	checkCantidad();
	checkPrecio();
	checkDescuento();
	checkImagen();
	if(!(__CODIGO && __NOMBRE && __PRECIO && __CANTIDAD && __DESCUENTO && __IMAGEN)) {
		event.preventDefault();
		$('#notificacion').empty(); 
		$('#notificacion').addClass('alert-danger'); 
		$('#notificacion').text('El formulario contiene errores. Por favor corríjalos antes de continuar.');
		$(window).scrollTop(0);
	}
}

function checkCodigo(event) {
	let codigo = $('#codigo').val();
	if(codigo.length > 0) {
		$.post('http://localhost:8000/check/' + codigo, (response) => {
			if(response === 'valido') {
				$('#codigo').removeClass('is-invalid');
				$('#codigo').addClass('is-valid');
				$('#alerta_codigo').text('');
				__CODIGO = true;
			} else if(response === 'vacio') {
				$('#codigo').removeClass('is-valid');
				$('#codigo').addClass('is-invalid');
				$('#alerta_codigo').text('El código no puede estar vacío.');
				__CODIGO = false;
			} else {
				$('#codigo').removeClass('is-valid');
				$('#codigo').addClass('is-invalid');
				$('#alerta_codigo').text('El código ya existe.');
				__CODIGO = false;
			}
		});
	} else {
		$('#codigo').removeClass('is-valid');
		$('#codigo').addClass('is-invalid');
		$('#alerta_codigo').text('El código no puede estar vacío.');
		__CODIGO = false;
	}
}

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

function checkPrecio(event) {
	let precio = $('#precio').val();
	if(precio.length > 0){
		if(isNaN(precio)){
			$('#precio').addClass('is-invalid');
			$('#alerta_precio').text('El precio debe ser un número real.');
			__PRECIO = false;
		} else {
			if(precio < 0){
				$('#precio').addClass('is-invalid');
				$('#alerta_precio').text('El precio debe ser mayor a 0.00');
				__PRECIO = false;
			} else {
				$('#precio').removeClass('is-invalid');
				$('#alerta_precio').text('');
				__PRECIO = true;
			}
		}
	} else {
		$('#precio').removeClass('is-invalid');
		$('#alerta_precio').text('');
		__PRECIO = true;
	}
}

function checkCantidad(event) {
	let cantidad = $('#cantidad').val();
	if(cantidad.length > 0){
		if(isNaN(cantidad) || cantidad.indexOf('.') !== -1){
			$('#cantidad').addClass('is-invalid');
			$('#alerta_cantidad').text('La cantidad debe ser un número entero.');
			__CANTIDAD = false;
		} else {
			if(cantidad < 0){
				$('#cantidad').addClass('is-invalid');
				$('#alerta_cantidad').text('La cantidad debe ser mayor o igual a 0');
				__CANTIDAD = false;
			} else {
				$('#cantidad').removeClass('is-invalid');
				$('#alerta_cantidad').text('');
				__CANTIDAD = true;
			}
		}
	} else {
		$('#precio').removeClass('is-invalid');
		$('#alerta_precio').text('');
		__PRECIO = true;
	}
}

function checkVisibilidad(event) {
	let value = $('#visibilidad').val();
	if(value === 'privado'){
		setTimeout(()=>{$('#alerta_visibilidad').text('El producto no podrá ser visualizado por los clientes.');}, 200);
	} else {
		setTimeout(()=>{$('#alerta_visibilidad').text('Los clientes podrán ver el producto.');}, 200);
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

function checkDescuento(event) {
	let descuento = $('#descuento').val();
	if(descuento.length > 0){
		if(isNaN(descuento)){
			$('#descuento').addClass('is-invalid');
			$('#alerta_descuento').text('El descuento debe ser un número real.');
			__DESCUENTO = false;
		} else {
			if(descuento < 0){
				$('#descuento').addClass('is-invalid');
				$('#alerta_descuento').text('El descuento debe ser mayor a 0.00');
				__DESCUENTO = false;
			} else {
				$('#descuento').removeClass('is-invalid');
				$('#alerta_descuento').text('');
				__DESCUENTO = true;
			}
		}
	} else {
		$('#descuento').removeClass('is-invalid');
		$('#alerta_descuento').text('');
		__DESCUENTO = true;
	}
}