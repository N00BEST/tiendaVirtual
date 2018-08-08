$(window).scroll(desplegarProducto);
$.get('http://localhost:8000/Producto/all', (response) => {
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
			for(let i = 0; i < 2 && i < tope; i++){
				let modelo = Productos.shift();

				let card = document.createElement('div');
				let body = document.createElement('div');
				let imagen = document.createElement('img');
				let titulo = document.createElement('h5');
				let descripcion = document.createElement('p');
				let precio = document.createElement('p');
				let verMas = document.createElement('a');

				card.className = "card";
				card.style = "width: 18rem;";
				card.id = modelo.codigo;
				card.href = "/Producto/" + modelo.codigo;

				imagen.className = "card-img-top";
				imagen.src = modelo.imagen;
				imagen.alt = "Card image cap";

				body.className = "card-body";

				titulo.className = "card-title";
				titulo.innerText = modelo.nombre;

				descripcion.className = "card-text text-body";
				descripcion.innerText = modelo.descripcion;

				precio.className = "text-muted";
				precio.innerText = modelo.precio;

				verMas.href = '/Producto/' + modelo.codigo;
				verMas.style = ' text-decoration: none !important;';

				$(body).append(titulo, descripcion, precio);
				$(card).append(imagen, body);
				$(verMas).append(card);
				$('#Productos').append(verMas);

			}
		}
	}

}