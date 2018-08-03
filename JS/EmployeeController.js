const database = require('./EmployeeDB');

module.exports.postModel = (model) => {
	return new Promise(
		(resolve, reject) => {
			database.Modelo.create(model).then((row)=>{
				console.log(`[ ÉXITO ] Modelo ${row.codigo}-${row.nombre} creado.`);
				resolve(row);
			}).catch((err)=>{
				console.log(`[ ERROR ] Modelo ${model.codigo}-${model.nombre} no se pudo crear.`);
				reject(null);
			});
		}
	);
}

module.exports.postColor = (color)=> {
	return new Promise(
		(resolve, reject) => {
			database.Color.create(color).then((row)=>{
				console.log(`[ ÉXITO ] Color ${row.ID}-${row.nombre} creado.`);
				resolve();
			}).catch((err)=>{
				console.log(`[ ERROR ] Color ${color.ID}-${color.nombre} no se pudo crear.`);
				reject();
			});
		}
	);
};

module.exports.postTalla = (talla)=> {
	return new Promise(
		(resolve, reject) => {
			database.Talla.create(talla).then((row)=>{
				console.log(`[ ÉXITO ] Talla "${row.ID}-${row.nombre}" creada.`);
				resolve();
			}).catch((err)=>{
				console.log(`[ ERROR ] Talla "${talla.ID}-${talla.nombre}" no se pudo crear.`);
				reject();
			});
		}
	);
};

module.exports.postCategoria = (categoria)=> {
	return new Promise(
		(resolve, reject) => {
			database.Categoria.create(categoria).then((row)=>{
				console.log(`[ ÉXITO ] Categoria "${row.ID}-${row.nombre}" creada.`);
				resolve();
			}).catch((err)=>{
				console.log(`[ ERROR ] Categoria "${categoria.ID}-${categoria.nombre}" no se pudo crear.`);
				reject();
			});
		}
	);
};

module.exports.postInventario = (producto)=> {
	return new Promise(
		(resolve, reject) => {
			database.Inventario.create(producto).then((row)=>{
				console.log(`[ ÉXITO ] Producto "${row.modeloID}-${row.colortalla}" creada.`);
				resolve();
			}).catch((err)=>{
				console.log(`[ ERROR ] Producto "${producto.modeloID}-"${producto.colortalla}" no se pudo crear.`);
				reject();
			});
		}
	);
};

module.exports.existeModelo = (codigo) => {
	return new Promise(
		(resolve, reject) => {
			database.Modelo.findAll({codigo: codigo}).then((row)=>{
				if(row.length == 0) {
					reject(null);
				} else {
					resolve();
				}
			}).catch((err)=>{
				reject(err);
			});
		}
	)
}