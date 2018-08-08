$(window).scroll(desplegarProducto);
$.get('http://localhost:8000/Producto/all', (response) => {
	Productos = response;
});
var Productos;

function desplegarProducto(){
	let posicion = $(document).scrollTop() + $(window).height();
	if(posicion > $(document).height() - 150){
		if(typeof Productos !== 'undefined') {
			//En caso de que ya se hayan cargado los Productos desde el API
			for(let i = 0; i < 10 && i < Productos.length; i++){
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

				imagen.className = "card-img-top";
				imagen.src = modelo.imagen;
				imagen.alt = "Card image cap";

				body.className = "card-body";

				titulo.className = "card-title";
				titulo.innerText = modelo.nombre;

				descripcion.className = "card-text";
				descripcion.innerText = modelo.descripcion;

				precio.className = "text-muted";
				precio.innerText = modelo.precio;

				verMas.href = "/Producto/" + modelo.codigo;
				verMas.innerText = "Ver más...";

				$(body).append(titulo, descripcion, precio, verMas);
				$(card).append(imagen, body);
				$('#desplegar').append(card);

			}
		}
	}

}