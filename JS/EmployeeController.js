const database = require('./EmployeeDB');
const path = require('path');
const fs = require('fs');
const files = require('./Files');
const sequelize = require('sequelize');
const sha256 = require('crypto-js/sha256');
const Op = sequelize.Op;

module.exports.postModel = (model) => {
	return new Promise(
		(resolve, reject) => {
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
				resolve(row);
			}).catch((err)=>{
				console.log(`[ ERROR ] Categoria "${categoria.ID}-${categoria.nombre}" no se pudo crear.`);
				reject(err);
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
					resolve(row[0]);
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
					resolve(row);
				}).catch((err)=>{
					reject(err);
				});
			}
		});	
	});
};

module.exports.getCategorias = () =>{
	return new Promise((resolve, reject)=>{
		//Select * from categorias;
		database.Categoria.findAll().then((rows)=>{
			console.log(`[ EXITO ] Se consultaron ${rows.length} categorías. `)
			resolve(rows);
		}).catch((err)=>{
			console.log(`[ ERROR ] No se pudo consultar las categorías. ${err.message} `);
			reject();
		});
	});
};

module.exports.getCategoria = (id) =>{
	if(typeof id === 'undefined' || isNaN(id) || id.length === 0) {
		return Promise.reject(new Error('404'));
	} else {
		return new Promise((resolve, reject)=>{
			database.Categoria.find({
				where: {
					ID: id
				}
			}).then((categoria)=>{
				if(categoria){
					resolve(categoria);
				} else {
					reject(new Errro('404'));
				}
			}).catch((err)=>{
				reject(err);
			})
		});
	}
};

module.exports.pertenece = (modelo, categoria) =>{
	if(typeof modelo === 'undefined' || typeof categoria === 'undefined'
	   || modelo.length === 0 || categoria.length === 0){
		//Si no se ingresan un nombre o una categoría.
		return Promise.reject(new Error('Modelo o categoría incorrectos.'));
	} else {
		return new Promise((resolve, reject)=>{
			let row = {
				modeloID: modelo,
				categoriumID: categoria
			}
			database.Pertenece.create(row).then((row)=>{
				resolve();
			}).catch((err)=>{
				reject(err);
			});
		});
	}
};

module.exports.agregarCategoria = (categoria, file) => {
	return new Promise((resolve, reject)=>{
		module.exports.postCategoria(categoria).then((guardada)=>{
			let imagen;
			if(typeof file !== 'undefined'){
				let oldPath = __dirname + '/../' + file.path;
				let newPath = __dirname + '/../Public/IMG/categorias/' + guardada.ID + path.extname(oldPath);
				fs.renameSync(path.resolve(oldPath), path.resolve(newPath));
				imagen = 'IMG/categorias/' + path.basename(newPath);
			} else {
				imagen = 'IMG/categorias/default.png';
			}
			guardada.updateAttributes({
				imagen: imagen
			}).then(()=>{
				resolve();
			}).catch((error)=>{
				console.log('[ ERROR ] ' + err.message);
				reject(error);
			});
		}).catch((err)=>{
			console.log('[ ERROR ] ' + err.message);
			reject(err);
		});
	});
};

module.exports.existeCategoria = (nombre) => {
	console.log(`[ BUSCANDO - Empleado ] ${nombre} `)
	if(typeof nombre === 'undefined' || nombre === '') {
		//Si el nombre es undefined 
		return Promise.reject(new Error('404'));
	} else {
		return new Promise((resolve, reject)=>{
			//Select * from database where nombre = 'nombre'
			database.Categoria.findAll({
				where: {
					nombre: nombre
				}
			}).then((categorias)=>{
				if(categorias.length === 0){
					reject(new Error('404'));
				} else {
					resolve(categorias[0]);
				}
			}).catch((err)=>{
				reject(err);
			});
		});
	}
};

module.exports.getProductosCategoria = (id) => {
	if(typeof id === 'undefined' || isNaN(id) || id.length === 0){
		return Promise.reject(new Error(400));
	} else {
		return new Promise ((resolve, reject)=>{
			database.Pertenece.findAll({
			attributes: ['modeloID'],
			where: {
				categoriumID: id
			}, 
			order: [
				[sequelize.col('modeloID'), 'ASC']
			]
			}).then((consulta)=>{
				if(consulta.length > 0) {
					//Tratar ID's para la segunda consulta
					let ids = [];
					let tope = consulta.length;
					for(let i = 0; i < tope; i++) {
						let producto = consulta.shift();
						ids.push(producto.modeloID);
					}
					database.Modelo.findAll({
						where: {
							ID: {
								[Op.in]: ids
							}
						}
					}).then((productos)=>{
						resolve(productos);
					}).catch((err)=>{
						reject(err);
					})
				} else {
					resolve([]);
				}
			}).catch((err)=>{
				reject(err);
			});
		});
	}
};

module.exports.visitarCategoria = (id) =>{
	if(typeof id === 'undefined' || isNaN(id) || id.length === 0) {
		return Promise.reject(new Error('404'));
	} else {
		return database.DB.transaction((t)=>{
			return database.Categoria.find({
				where: { 
					ID: id
				}
			}, { transaction: t }).then((categoria)=>{
				if(categoria){
					return categoria.updateAttributes({
						visitas: categoria.visitas + 1
					}, { transaction: t }).then((row)=>{
					}).catch((err)=>{
						throw err;
					});
				} else {
					throw new Error('404');
				}
			}).catch((err)=>{
				throw err;
			});
		});
	}
};

module.exports.getProductos = () => {
	return new Promise((resolve, reject)=>{
		database.Modelo.findAll({
			order: [
				[sequelize.col('codigo'), 'ASC']
			]
		}).then((productos)=>{
			resolve(productos);
		}).catch((err)=>{
			reject(err);
		});
	});
};

module.exports.existeCorreo = (correo) => {
	if(typeof correo === 'undefined' || correo.length === 0) {
		return Promise.reject(new Error('400'));
	} else {
		return new Promise((resolve, reject)=>{
			database.Empleado.findAll({
				where: {
					correo: correo
				}
			}).then((empleado)=>{
				if(empleado.length === 0) {
					reject(new Error('404'));
				} else {
					resolve(empleado[0]);
				}
			}).catch((err)=>{
				reject(err);
			});
		});
	}
};

module.exports.postEmpleado = (empleado) => {
	return new Promise((resolve, reject)=>{
		switch(empleado.rol.toLowerCase()){
			case 'administrador': 
				empleado.rol = "Admin";
			break;

			case 'gerente':
				empleado.rol = "Gerente"; 
			break; 

			case 'vendedor': 
				empleado.rol = "Vendedor";
			break;
		}

		let token = files.genRandomName(64);
		let hash = sha256(empleado.correo + token + empleado.password).toString();
		console.log("Hash creado " + hash);

		empleado.password = hash;
		empleado.token = token;
		database.Empleado.create(empleado).then((row)=>{
			resolve();
		}).catch((err)=>{
			reject(err);
		})
	});
};

module.exports.login = (correo, pass) => {
	return new Promise((resolve, reject)=>{
		database.Empleado.find({
			where: {
				correo: correo
			}
		}).then((empleado) => {
			let token = empleado.token;
			let hash = sha256(correo + token + pass).toString();
			console.log('Hash para verificar ' + hash);
			if(hash === empleado.password){
				resolve();
			} else {
				reject(new Error('401'));
			}
		}).catch((err)=>{
			reject(err);
		});
	});
};