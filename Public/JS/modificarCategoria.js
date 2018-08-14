$(document).ready(()=>{
	desplegarProductosCategoria();
	desplegarProductos();
});

function desplegarProductosCategoria(){
	$.get("https://localhost:8000/categoria/" + $('#ID').val(), (response)=>{
		let tope = response.length();
		for(let i = 0; i < tope; i++) {
			let producto = response.shift();
			
			let tr = document.createElement('tr');
			let td = document.createElement('td');
			let check = document.createElement('input');
			let codigo = document.createElement('td');
			let nombre = document.createElement('td');
			
			$(check).on('change', remover);
			codigo.innerText = producto.codigo;
			nombre.innerText = producto.nombre;

			check.type = "checkbox";
			check.className = "form-check-input form-check-inline";
			check.name = producto.codigo;
			check.value = true;

			codigo.className = "w-25";

			$(tr).append(codigo, nombre);
			$('#tablaProductoQuitar').append(tr);

		}
	});
}