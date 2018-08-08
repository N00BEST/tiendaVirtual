const database = require('./EmployeeDB');
const path = require('path');
const fs = require('fs');
const files = require('./Files');

module.exports.postModel = (model) => {
	return new Promise(
		(resolve, reject) => {
			model.publico = true;
			database.Modelo.create(model).then((row)=>{
				console.log(`[ ÉXITO ] Modelo ${row.codigo}-${row.nombre} creado.`);
				resolve(row);
			}).catch((err)=>{
				console.log(`[ ERROR ] Modelo ${model.codigo}-${model.nombre} no se pudo crear. ${err}`);
				reject(null);
			});
		}
	);
};

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
			database.Modelo.findAll({where: {codigo: codigo}}).then((row)=>{
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

module.exports.validarImagen = (file, cb) => {
	// Regular expresion con las extensiones permitidas
	const regex = /jpeg|jpg|png|gif/;

	//Evaluar si la extensión del archivo coincide con la expresion regular
	const extname = regex.test(path.extname(file.originalname).toLowerCase());

	//Evaluar si el mimetype del archivo coincide con la expresión regualr
	const mime = regex.test(file.mimetype);

	if(extname && mime) {
		cb(null, true);
	} else {
		cb('El archivo no es una imagen');
	}
};

module.exports.agregarModelo = (modelo, file) => {
	return new Promise ((resolve, reject) => {
		module.exports.existeModelo(modelo.codigo).then(()=>{
			reject('duplicado');
		}).catch((err)=>{
			if(err) {
				console.log(err);
				reject(err);
			} else {
				let imagen;
				if(typeof file !== 'undefined'){
					let oldPath = __dirname + '/../' + file.path;
					let newPath = __dirname + '/../Public/IMG/Productos/' + modelo.codigo + path.extname(oldPath);
					if(path.basename(newPath) === 'default.jpg') {
						newPath = __dirname + '/../Public/IMG/Productos/' + files.genRandomName(5) + path.extname(oldPath);
						imagen = 'IMG/Productos/' + path.basename(newPath);
					} else {
						imagen = 'IMG/Productos/'+modelo.codigo + path.extname(oldPath);
					}
					fs.renameSync(path.resolve(oldPath), path.resolve(newPath));
				} else {
					imagen = 'IMG/Productos/default.jpg';
				}
				modelo.imagen = imagen;
				module.exports.postModel(modelo).then((row)=>{
					resolve();
				}).catch((err)=>{
					reject(err);
				});
			}
		});	
	});
};