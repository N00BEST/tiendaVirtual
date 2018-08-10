const database = require('./ClientDB');
const sequelize = require('sequelize');
const files = require('./Files');
const sha256 = require('crypto-js/sha256');
const {or} = sequelize.Op;

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

module.exports.getProducto = (codigo) => {
	return new Promise((resolve, reject) => {
		database.Modelo.findAll({where: {codigo: codigo}}).then((row)=>{
			if(row.length > 0) {
				resolve(row[0]);
			} else {
				reject();
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
				[or]:  [{
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
			console.log('ERROR: ' + err);
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