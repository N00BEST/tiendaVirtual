$(document).ready(()=>{
	iniciarAgregar();
	iniciarQuitar();
});

function iniciarAgregar(){
	$(".card-body button.agg").off('click', agregar);
	$(".card-body button.agg").on('click', agregar);
}

function iniciarQuitar(){
	$(".card-body button.quit").off('click',quitar);
	$(".card-body button.quit").on('click',quitar);
}

function agregar(event) {
	let me = '#' + $(event.target).attr('id');
	let codigo = me.substr(me.indexOf('_') + 1);
	$.post('http://localhost:8000/agregar/' + codigo, {}, (response)=>{
		$('#alerta_' + codigo).removeClass('text-danger');
		$('#alerta_' + codigo).addClass('text-muted');
		$('#alerta_' + codigo).text('Producto agregado al carrito.');
		let msg = 'Tiene ' + response + ' artículo';
		msg += response > 1 ? 's ' : ' '; 
		msg += "de este producto en el carrito";
		$('#cantidad_' + codigo).text(msg);
	}).catch((err)=>{
		$('#alerta_' + codigo).removeClass('text-muted');
		$('#alerta_' + codigo).addClass('text-danger');
		switch(err.status) {
			case 500: 
				$('#alerta_' + codigo).text('Hubo un error al intentar agregar este producto.');
			break;

			case 404: 
				$('#alerta_' + codigo).text('Este producto no existe.');
			break;

			case 503:
				$('#alerta_' + codigo).text('Este producto no está disponible.');
			break;
		}
	});
};

function quitar(event) {
	let me = '#' + $(event.target).attr('id');
	let codigo = me.substr(me.indexOf('_') + 1);
	$.post('http://localhost:8000/quitar/' + codigo).then((cantidad)=>{
		$('#alerta_' + codigo).addClass('text-muted');
		$('#alerta_' + codigo).removeClass('text-danger');
		if(cantidad === '0'){
			$('#' + codigo).remove();
			if($('#Productos').children().length === 0){
				window.location.href = '/MiCarrito';
			}
		} else {
			let msg = 'Tiene ' + cantidad + ' artículo';
			msg += cantidad > 1 ? 's ' : ' '; 
			msg += "de este producto en el carrito";
			$('#cantidad_' + codigo).text(msg);
		}
		$('#alerta_' + codigo).text('Se ha quitado un artículo de este producto de su carrito.');
	}).catch((err)=>{
		$('#alerta_' + codigo).addClass('text-danger');
		$('#alerta_' + codigo).removeClass('text-muted');
		switch(err.status){
			case 500: 
				$('#alerta_' + codigo).text('Hubo un error al intentar quitar este producto.');
			break;

			case 404: 
				$('#alerta_' + codigo).text('Este producto no existe.');
			break;

			case 503:
				$('#alerta_' + codigo).text('Este producto no está en su carrito.');
			break;
		}
	});
}