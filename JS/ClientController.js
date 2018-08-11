const database = require('./ClientDB');
const sequelize = require('sequelize');
const files = require('./Files');
const sha256 = require('crypto-js/sha256');
const Op = sequelize.Op;

module.exports.existeCorreo = (correo) => {
	return new Promise((resolve, reject)=> {
		//Buscar todas las filas donde el correo sea el que se busca
		database.Cliente.findAll({where: {correo: correo}}).then((row)=>{
			if(row.length === 0) {
				//Si la cuenta es igual a cero, el correo no está registrado
				reject(null);
			} else {
				//Si la cuenta es distinta de cero, el correo está registrado.
				resolve(row[0]);
			}
		}).catch((err) => {
			//Si ocurre un error durante la búsqueda, retornar el error.
			reject(err);
		});
	});
};

module.exports.existeCedula = (cedula) => {
	return new Promise((resolve, reject)=>{
		database.Cliente.findAll({where: {cedula: cedula}}).then((row)=>{
			if(row.length === 0) {
				//Si la cuenta es igual a cero, la cédula no está registrada
				reject(null);
			} else {
				//Si la cuenta es distinta de cero, la cédula está registrada.
				resolve(row);
			}
		}).catch((err)=>{
			reject(err);
		});
	});
};

module.exports.postCliente = (cliente) => {
	return new Promise(
		(resolve, reject) => {
			database.Cliente.create(cliente).then((row)=>{
				console.log(`[ ÉXITO ] Cliente ${row.correo}-${row.nombre} ${row.apellido} creado.`);
				resolve(row);
			}).catch((err)=>{
				console.log(`[ ERROR ] Cliente ${cliente.correo}-${cliente.nombre} ${cliente.apellido} no se pudo crear. ${err}`);
				reject(null);
			});
		}
	);
};

module.exports.getProductos = () => {
	return new Promise(
		(resolve, reject) => {
			database.Modelo.findAll({where: {publico: true}}).then((row)=>{
				resolve(row);
			}).catch((err)=>{
				reject(err);
			});
		}
	);
};

module.exports.getCarrito = (articulos) => {
	return new Promise((resolve, reject)=>{
		if(articulos.length > 0) {
			database.Modelo.findAll({
				//select * from modelos where codigo in articulos
				where: {
					codigo: { [Op.in]: articulos }
				}
			}).then((rows)=>{
				console.log(`[ EXITO ] Se encontraron ${rows.length} artículos en el carrito anónimo.`);
				resolve(rows);
			}).catch((err)=>{
				console.log(`[ ERROR ] No se pudo recuperar artículos del carrito anónimo. ${err}`);
				reject(err);
			});
		} else {
			//Si no hay elementos en el carrito, no se consulta la BBDD.
			console.log(`[ EXITO ] Se devolvió un carrito anónimo vacío.`);
			resolve([]);
		}
	});
};

module.exports.getProducto = (codigo) => {
	return new Promise((resolve, reject) => {
		database.Modelo.findAll({where: {codigo: codigo}}).then((row)=>{
			if(row.length > 0) {
				resolve(row[0]);
			} else {
				reject(new Error('404'));
			}
		}).catch((err)=>{
			reject();
		});
	});
};

module.exports.buscarProducto = (patron) => {
	return new Promise((resolve, reject)=>{
		let lookupValue = patron.toLowerCase().trim();
		database.Modelo.findAll({
			where: {
				[Op.or]:  [{
							nombre: sequelize.where(sequelize.fn('LOWER', sequelize.col('nombre')), 'LIKE', '%' + lookupValue + '%')
						},
						{
							descripcion: sequelize.where(sequelize.fn('LOWER', sequelize.col('descripcion')), 'LIKE', '%' + lookupValue + '%')
						}]
			}
		}).then((rows)=>{
			console.log(`[ BUSQUEDA = "${lookupValue}" ] Se encontraron ${rows.length} productos que coinciden con la busqueda.`);
			resolve(rows);
		}).catch((err)=>{
			console.log('[ ERROR ] ' + err);
			reject(err);
		});
	});
};

module.exports.agregarCliente = (cliente) => {
	return new Promise((resolve, reject)=>{
		module.exports.existeCorreo(cliente.correo).then(()=>{
			//Si el correo ya existe
			console.log(`[ ERROR ] El correo ${cliente.correo} ya está registrado`);
			reject('duplicado');
		}).catch((err)=>{
			//Si el correo no existe aún
			if(!err){
				//Si no hubo un error en la consulta del correo
				const token = files.genRandomName(64);
				const hash = sha256(cliente.correo + token + cliente.password).toString();
				cliente.password = hash;
				cliente.token = token;
				module.exports.postCliente(cliente).then((client)=>{
					let obj = {
						correo: client.correo,
						nombre: client.nombre
					}
					resolve(obj);
				}).catch((err)=>{
					reject(err);
				});
			} else {
				console.log(err);
				reject(err);
			}
		});
	});
};

module.exports.iniciarSesion = (cliente) =>{
	return new Promise((resolve, reject)=> {
		module.exports.existeCorreo(cliente.correo).then((row)=>{
			const hash = sha256(cliente.correo + row.token + cliente.password).toString();
			if(row.password === hash) {
				let obj = {
					correo: row.correo,
					nombre: row.nombre,
					apellido: row.apellido
				}
				console.log(`[ EXITO ] Sesión iniciada.`);
				resolve(obj);
			} else {
				console.log(`[ ERROR ] Clave incorrecta.`);
				reject('incorrecta');
			}
		}).catch((err)=>{
			if(!err){
				console.log(`[ ERROR ] Correo no existe.`);
				reject('no existe');
			} else {
				console.log(`[ ERROR ] ${err}.`);
				reject(err);
			}
		});
	});
};

module.exports.alCarrito = (codigo, correo) =>{
	if(typeof codigo === 'undefined' || codigo.length === 0){
		//Si no indican el código o el código es vacío, retornar no encontrado.
		return Promise.reject('404');
	}
	if(typeof correo === 'undefined'){
		//Usuario anónimo
		return database.DB.transaction((t)=>{
			//Select * from modelos where codigo = 'codigo'
			return database.Modelo.findAll({
				where: {codigo: codigo}
			}, {transaction: t}).then((row)=>{
				//Resultado de la query
				if(row.length === 0) {
					//Si no se encontró el producto
					let error = new Error('404');
					throw error;
				} else if(row[0].cantidad === 0 || !row[0].publico) {
					//Si no está disponible el producto
					let error = new Error('no');
					throw error;
				}
			}).catch((err)=>{
				throw err;
			});
		});
	} else {
		return new Promise((resove, reject)=>{
			database.Cliente.findAll({
				where: {
					correo: correo
				}
			}).then((row)=>{
				if(row.length > 0) {

				} else {
					return
				}
			}).catch((err)=>{
				reject(err);
			});
		});
	}
};

module.exports.quitarCarrito = (codigo, correo) =>{
	if(typeof codigo === 'undefined' || codigo.length === 0) {
		return Promise.reject(new Error('404'));
	}
	if(typeof correo === 'undefined'){
		//Si el usuario es anónimo sólo verificamos si existe el producto
		return new Promise((resolve, reject)=>{
			module.exports.getProducto(codigo).then(()=>{
				resolve();
			}).catch((err)=>{
				reject(err);
			});
		});
	}
};