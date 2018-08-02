$(document).ready(()=>{
	var codigo, descripcion;
	$("#submit").click( ()=> {
		nombre = $("#nombre").val();
		descripcion = $("#descripcion").val();
		if(nombre.length > 0){
			$.post("http://localhost:8000/nuevaCategoria", 
				{
					nombre: nombre.trim(),
					descripcion: descripcion.trim()
				}, 
				(response) => {
					let notificacion = document.createElement("div");
					let clase = "alert alert-";
					let mensaje;
					if(response === 'true') {
						clase += "success";
						mensaje = `La categoria <strong>${nombre}</strong> fue agregada <strong>éxitosamente</strong>.`;
						$("#nombre").val("");
						$("#descripcion").val("");
					} else {
						clase += "danger";
						mensaje = `<strong>No</strong> se pudo agregar la categoría`;
					}
					$("#notificacion").empty();
					notificacion.className = clase;
					notificacion.innerHTML = mensaje;
					$("#notificacion").append(notificacion);
				});
		} else {
			let notificacion = document.createElement("div");
			notificacion.className = "alert alert-danger";
			notificacion.innerHTML = "<strong>Error:</strong> El nombre no puede estar vacío";
			$("#notificacion").empty();
			$("#notificacion").append(notificacion);
		}
	});
});