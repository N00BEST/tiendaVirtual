$(window).scroll(desplegarProducto);
$.get('http://localhost:8000/producto/all', (response) => {
	Productos = response;
	desplegarProducto();
});
var Productos;

function desplegarProducto(){
	let posicion = $(document).scrollTop() + $(window).height();
	if(posicion > $(document).height() - $(window).height()){
		if(typeof Productos !== 'undefined') {
			//En caso de que ya se hayan cargado los Productos desde el API
			let tope = Productos.length;
			for(let i = 0; i < 10 && i < tope; i++){
				let modelo = Productos.shift();

				let card = document.createElement('div');
				let body = document.createElement('div');
				let imagen = document.createElement('img');
				let titulo = document.createElement('h5');
				let descripcion = document.createElement('p');
				let precio = document.createElement('p');
				let verMas = document.createElement('a');
				let a = document.createElement('a');
				let boton = document.createElement('button');
				let agotado = document.createElement('small');
				let notificacion = document.createElement('small');

				card.className = "card";
				card.style = "width: 18rem;";
				card.id = modelo.codigo;

				imagen.className = "card-img-top";
				imagen.src = modelo.imagen;
				imagen.alt = "Card image cap";

				body.className = "card-body";

				titulo.className = "card-title";
				titulo.innerText = modelo.nombre;

				agotado.innerText = modelo.disponible ? '' : 'AGOTADO';
				agotado.className = 'text-muted font-weight-bold';

				descripcion.className = "card-text text-body";
				descripcion.innerText = modelo.descripcion;

				precio.className = "text-muted";
				precio.innerText = modelo.precio;

				verMas.href = '/Producto/' + modelo.codigo;
				verMas.style = ' text-decoration: none !important;';

				a.href = '/Producto/' + modelo.codigo;
				a.style = ' text-decoration: none !important;';

				boton.id = 'boton_' + modelo.codigo;
				boton.className = 'btn btn-danger agg';
				boton.innerText = 'Agregar a Carrito';

				notificacion.id='alerta_' + modelo.codigo;

				$(verMas).append(titulo, agotado, descripcion, precio);
				$(body).append(verMas, boton, document.createElement('br'), notificacion);
				$(a).append(imagen);
				$(card).append(a, body);
				$('#Productos').append(card);

			}
			iniciarAgregar();
		}
	}

}