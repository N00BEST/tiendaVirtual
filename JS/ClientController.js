const database = require('./ClientDB');
const sequelize = require('sequelize');
const {or} = sequelize.Op;

module.exports.existeCorreo = (correo) => {
	return new Promise((resolve, reject)=> {
		//Buscar todas las filas donde el correo sea el que se busca
		database.Cliente.findAll({where: {correo: correo}}).then((row)=>{
			if(row-length === 0) {
				//Si la cuenta es igual a cero, el correo no está registrado
				reject(null);
			} else {
				//Si la cuenta es distinta de cero, el correo está registrado.
				resolve();
			}
		}).catch((err) => {
			//Si ocurre un error durante la búsqueda, retornar el error.
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
				console.log(`[ ERROR ] Cliente ${model.correo}-${model.nombre} ${row.apellido} no se pudo crear. ${err}`);
				reject(null);
			});
		}
	);
};

module.exports.getProductos = () => {
	return new Promise(
		(resolve, reject) => {
			database.Modelo.findAll({where: {publico: true}}).then((row)=>{
				console.log(`Recuperados ${row.length} artículos para publicar`);
				resolve(row);
			}).catch((err)=>{
				console.log(`Ocurrió un error al intentar recuperar los productos publicados`);
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