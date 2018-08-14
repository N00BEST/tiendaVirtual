$(document).ready(()=>{
	desplegar();
});

var producto; 

function setProdcuto(_producto) {
	producto = _producto;
}

function desplegar(){
	$('#codigo').val(producto.codigo);
	$('#nombre').val(producto.nombre);
	$('#descripcion').val(producto.descripcion);
	$('#desplegarImagen').src(producto.imagen);
	$('#precio').src(producto.precio);
	$('#cantidad').val(producto.cantidad);
	$('#descuento').val(producto.descuento);
	$('#visibilidad').selected(producto.publico ? 'publico' : 'privado');
}