$(document).ready(()=>{
	$.get('http://localhost:8000/producto/all', (response)=>{
		let tope = response.length;
		for(let i = 0; i < tope; i++) {
			let producto = response.shift();

			let tr = document.createElement('tr');
			let td = document.createElement('td');
			let cod = document.createElement('td');

			tr.id = producto.codigo;
			td.id = producto.codigo;
			$(td).text(`${producto.nombre}`);
			$(cod).text(producto.codigo);
			$(tr).append(cod, td);
			$(tr).on('click', ()=>{
				window.location.href = "/Admin/Producto/" + producto.codigo;
			});
			$('#tablaProducto').append(tr);
		}
	}).catch((err)=>{
	});
});