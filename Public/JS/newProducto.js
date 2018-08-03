$(document).ready(()=>{
	$("#submit").click(()=>{
		var codigo = $("#codigo").val();
		var nombre = $("#nombre").val();
		var descripcion = $("#descripcion").val();
		var imagen = $("#imagen").val();
		var precio = $("#precio").val();
		var cantidad = $("#cantidad").val();
		$("#notificacion").empty();
		console.log(`Foto: ${imagen}`);
		if(codigo.length > 0 && nombre.length > 0){
			if(isNaN(precio) || isNaN(cantidad) || precio < 0 || cantidad < 0) {
				//ERROR 
				let notificacion = document.createElement("div");
				notificacion.className = "alert alert-danger";
				let mensaje = "<strong>Error:</strong> ";
				if (isNaN(precio)) {
					mensaje += "El precio debe ser un número. Separe los decimales con un .";
				} else if (isNaN(cantidad)) {
					mensaje += "La cantidad debe ser un número. Separe los decimales con un ."; 
				} else if(precio < 0) {
					mensaje += "El precio no puede ser negativo";
				} else if(cantidad < 0) {
					mensaje += "La cantidad no puede ser negativa";
				}
				notificacion.innerHTML = mensaje;
				$("#notificacion").append(notificacion);
			} else {
				//Data válida
				$.post("http://localhost:8000/nuevoProducto",
					{
						codigo: codigo,
						nombre: nombre,
						descripcion: descripcion,
						foto: imagen,
						precio: precio,
						cantidad: cantidad
					},
					(response) => {
						let notificacion = document.createElement("div");
						notificacion.className = "alert alert-";
						let mensaje;
						response = JSON.parse(response);
						console.log(`Estatus de la respuesta: ${response.estado}`);
						if(response.estado === 'true'){
							notificacion.className += "success";
							mensaje = `El producto <strong>${response.codigo}-${response.nombre}</strong> fue agregado <strong>éxitosamente</strong>`;
							$("#codigo").val("");
							$("#nombre").val("");
							$("#descripcion").val("");
							$("#imagen").val("");
							$("#precio").val("0");
							$("#cantidad").val("0");
						} else if(response.estado === "duplicado"){
							notificacion.className += "danger";
							mensaje = `<stron>Error:</strong> El código <strong>${response.codigo}</strong> ya está registrado.`;
						} else {
							notificacion.className += "danger";
							mensaje = `<strong>Error:</strong> No se ha podido registrar el producto.`;
						}
						notificacion.innerHTML = mensaje;
						$("#notificacion").append(notificacion);
					});
			}
		}
	});
});