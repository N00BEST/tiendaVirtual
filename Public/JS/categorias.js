/*<a href=<%= '/Producto/' + categoria.mejores[j].codigo %>>
	<li class="list-group-item"><%= categoria.mejores[j].nombre %></li>
</a>*/
$(document).ready(()=>{
	desplegarProductos();
});

function desplegarProductos() {
	let categorias = $('#Categorias').children();
	let tope = categorias.length;
	for(let i = 0; i < tope; i++) {
		let categoria = categorias[i];
		$.get('http://localhost:8000/nuevos/' + categoria.id, (response)=>{
			let tope = response.length;
			for(let i = 0; i < tope; i++) {
				let producto = response.shift();
				let a = document.createElement('a');
				let li = document.createElement('li');

				li.className = "list-group-item";
				$(li).text(producto.nombre);

				a.href = '/Producto/' + producto.codigo;
				a.style = "text-decoration: none !important; border: 1px !important;"
				a.className = "text-body";
				
				$(a).append(li);
				$('#lista_' + categoria.id).append(a);
			}
		});
	}
};