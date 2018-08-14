function DesplegarCategorias(redirigir){
	$.get('http://localhost:8000/categoria/all', (response)=>{
		let tope = response.length;
		for(let i = 0; i < tope; i++) {
			let categoria = response.shift();

			let tr = document.createElement('tr');
			let td = document.createElement('td');

			tr.id = categoria.id;
			td.id = categoria.id;
			$(td).text(`${categoria.nombre}`);
			$(tr).append(td);
			$('#tablaCategoria').append(tr);
		}
		AgregarListeners(redirigir);
	}).catch((err)=>{
		switch(err.status){
			case 500:
				DesplegarCategorias(redirigir);
			break;
		}
	});
}

function AgregarListeners(redirigir){
	if(redirigir){
		$('#tablaCategoria tr').off('click', cambiar)
		$('#tablaCategoria tr').on('click', cambiar);
	} else {
		$('#tablaCategoria tr').off('click', listener);
		$('#tablaCategoria tr').on('click', listener);
	}
}

function listener(event){
	let me = $(event.target).attr('id');
	console.log(`Me: ${me}`);
}

function cambiar(event){
	let me = $(event.target).attr('id');
	window.location.href = '/Admin/Categoria/ ' + me;
}