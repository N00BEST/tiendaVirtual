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
				reject(new Error('404'));
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
			reject(err);
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
		return new Promise((resolve, reject)=>{
			module.exports.existeCorreo(correo).then((cliente)=>{
				//Select * from pedido where clienteID = 'cliente.ID' and estado = 'Carrito'
				database.Pedido.find({
					where: { 
						clienteID: cliente.ID,
						estado: 'Carrito'
					}
				}).then((pedido)=>{
					if(pedido){
						//Si existe el pedido
						//Buscar el producto
						module.exports.getProducto(codigo).then((producto)=>{
							database.Orden.findOrCreate({
								where: {
									modeloID: producto.ID,
									pedidoID: pedido.ID
								},
								defaults: {
									cantidad: 1,
									costo: producto.precio
								}
							}).then((orden)=>{
								//Orden es un arreglo. orden[0] es la orden y orden[1] es un booleano
								//indicando si se creó (true) o si se encontró (false)
								if(!orden[1]) {
									//Si el objeto fue encontrado
									orden[0].updateAttributes({
										cantidad: orden[0].cantidad + 1,
										costo: producto.precio * (orden[0].cantidad + 1)
									}).then(()=>{
										console.log(`[ EXITO ] Orden agregada `);
										resolve(orden[0].cantidad + 1);
									}).catch((err)=>{
										console.log(`[ ERROR ] En agregar al carrito. ${err.message} `);
										reject(err);
									});
								} else {
									resolve(1);
								}
							}).catch((err)=>{
								console.log(`[ ERROR ] En agregar al carrito. ${err.message} `);
								reject(err);
							});
						}).catch((err)=>{
							if(err.message !== '404'){
								console.log(`[ ERROR ] En agregar al carrito. ${err.message} `);
							}
							reject(err);
						});
					} else {
						//Si no existe el pedido
						let pedido = {
							costo_total: 0.00,
							estado: 'Carrito',
							clienteID: cliente.ID
						}
						database.Pedido.create(pedido).then((_pedido)=>{
							//Agregar orden al pedido
							module.exports.getProducto(codigo).then((producto)=>{
								let orden = {
									cantidad: 1,
									costo: producto.precio,
									modeloID: producto.ID, 
									pedidoID: _pedido.ID
								}
								database.Orden.create(orden).then(()=>{
									console.log('[ Exito ] Orden creada');
									resolve();
								}).catch((err)=>{
									console.log(`[ ERROR ] En agregar al carrito. ${err.message} `);
									reject(err);
								});
							}).catch((err)=>{
								if(err.message !== '404'){
									console.log(`[ ERROR ] En agregar al carrito. ${err.message} `);
								}
								reject(err);
							});
							
						}).catch((err)=>{
							console.log(`[ ERROR ] En agregar al carrito. ${err.message} `);
							reject(err);
						});
					}
				}).catch((err)=>{
					console.log(`[ ERROR ] Al agregar a carrito. ${err.message} `);
					reject(err);
				});
			}).catch((err)=>{
				if(err.message !== '404'){
					console.log(`[ ERROR ] Al agregar a carrito. ${err.message} `);
				} 
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
	} else {
		//Si ingresan un correo
		if(correo.length === 0) {
			//Si el correo es vacío
			return Promise.reject(new Error('404'));
		} else {
			return new Promise((resolve, reject)=>{
				module.exports.existeCorreo(correo).then((cliente)=>{
					//Si el correo existe
					//Select ID from pedidos where clienteID = 'cliente.ID' and estado = 'Carrito'
					database.Pedido.find({
						attributes: ['ID'],
						where: {
							clienteID: cliente.ID,
							estado: 'Carrito'
						}
					}).then((pedido)=>{
						//Si el pedido existe
						if(pedido){
							//Buscar el producto
							module.exports.getProducto(codigo).then((producto)=>{
								//Buscar la orden para modificarla
								database.Orden.find({
									where: {
										modeloID: producto.ID,
										pedidoID: pedido.ID
									}
								}).then((orden)=>{
									if(orden.cantidad === 1) {
										orden.destroy().then(()=>{
											resolve(0);
										}).catch((err)=>{
											console.log('[ ERROR ] ' + err.message);
											reject(err);
										});
									} else {
										orden.updateAttributes({
											cantidad: orden.cantidad - 1,
											costo: producto.precio * (orden.cantidad - 1)
										}).then((_orden)=>{
											resolve(_orden.cantidad);
										}).catch((err)=>{
											console.log('[ ERROR ] ' + err.message);
											reject(err);
										});
									}
								}).catch((err)=>{
									console.log('[ ERROR ] ' + err.message);
									reject(err);
								});
							}).catch((err)=>{
								console.log('[ ERROR ] ' + err.message);
								reject(err);
							});
						} else {
							//Si el pedido no existe
							reject(new Error('503'));
						}
					}).catch((err)=>{
						console.log('[ ERROR ] ' + err.message);
						reject(err);
					});
				}).catch((err)=>{
					console.log('[ ERROR ] ' + err.message);
					reject(err);
				})
			});
		}
	}
};

module.exports.sincronizarCarrito = (carrito, correo) =>{
	// Tomar un carrito anónimo y sincronizarlo con la BBDD
	// Actualizando con los que haya escogido en la sesión anónima nuevos.
	if(typeof carrito === 'undefined' || typeof correo === 'undefined' || 
		correo.length === 0){
		//Si el carrito o el correo están vacíos, retornar error
		return Promise.reject(new Error('404'));
	} else {
		return new Promise((resolve, reject)=>{
			//Verificar si el correo existe
			module.exports.existeCorreo(correo).then((cliente)=>{
				//Si el correo está registrado, recuperar el carrito del usuario
				//Select * from pedidos where clienteID = 'cliente.ID' and estado = 'Carrito'
				database.Pedido.findAll({ where: {
					clienteID: cliente.ID,
					estado: 'Carrito'
				}}).then((row)=>{
					if(row.length === 0) {
							//Si no tiene un carrito activo
							//Crear un carrito nuevo
							let pedido = {
								clienteID: cliente.ID,
								estado: 'Carrito'
							};
							database.Pedido.create(pedido).then((_pedido)=>{
								//Si se pudo crear el pedido
								let tope = carrito.productos.length;
								for(let i = 0; i < tope; i++) {
									let aux = carrito.productos.shift();
									//Buscar el producto
									module.exports.getProducto(aux).then((producto)=>{
										//Si consigue el producto
										let orden = {
											cantidad: carrito[aux] || 0,
											costo: carrito[aux] * producto.precio || 0.00,
											pedidoID: _pedido.ID,
											modeloID: producto.ID
										}
										database.Orden.create(orden).then((_orden)=>{
											console.log(`[ EXITO ] Orden creada éxitosamente `);
										}).catch((err)=>{
											console.log(`[ ERROR ] Ocurrió un error en sincronizarCarrito al crear orden. ${err.message}`);
										});
									}).catch((err)=>{
										//Si ocurre un error durante la búsqueda del producto
										if(err.message !== '404'){
											console.log(`[ ERROR ] Ocurrió un error en sincronizarCarrito al buscar el producto ${aux}. ${err.message}`);
										}
									})
								}
								resolve();
							}).catch((err)=>{
								//Si ocurre un error durante la consulta
								console.log(`[ ERROR ] Ocurrió un error en sincronizarCarrito al crear pedido ${JSON.stringify(pedido)}. ${err.message}`);
								reject(err);
							});
					} else {
						//Si tiene un carrito activo
						//Buscamos las órdenes del carrito activo que estén en el carro anónimo
						//Actualizamos todo a los valores del carro anónimo
						let pedido = row[0]; 
						let tope = carrito.productos.length;
						for(let i = 0; i < tope; i++) {
							let codigo = carrito.productos.shift();
							//Select * from modelos where codigo = 'codigo'
							module.exports.getProducto(codigo).then((producto)=>{
								//Select * from ordens where modeloID = 'producto.ID' and pedidoID = 'pedido.ID'
								database.Orden.find({ where: { 
									modeloID: producto.ID,
									pedidoID: pedido.ID
								} }).then((orden)=>{
									if(orden){	
										//Si la orden ya existe
										orden.updateAttributes({
											cantidad: carrito[codigo] || 0,
											costo: carrito[codigo] * producto.precio
										}).then(()=>{
											console.log(`[ EXITO ] Orden actualizada`);
										}).catch((err)=>{
											console.log(`[ ERROR ] En sincronizar carrito: ${err.message}`);
										});
									} else {
										//Si la orden no existe
										orden = {
											cantidad: carrito[codigo] || 0,
											costo: carrito[codigo] * producto.precio,
											modeloID: producto.ID,
											pedidoID: pedido.ID
										}
										database.Orden.create(orden).then(()=>{
											console.log(`[ EXITO ] Orden actualizada`);
										}).catch((err)=>{
											console.log(`[ ERROR ] En sincronizar carrito: ${err.message}`);
										});
									}
								}).catch((err)=>{
									console.log(`[ ERROR ] En sincronizar carrito: ${err.message}`);
								});
							}).catch((err)=>{
								console.log(`[ ERROR ] En sincronizar carrito: ${err.message}`);
							});
						}
						resolve();
					}
				}).catch((err)=>{
					//Si ocurre un error durante la consulta
					console.log(`[ ERROR ] Ocurrió un error en sincronizarCarrito al buscar pedidos. ${err.message}`);
					reject(err);
				});
			}).catch((err)=>{
				//Si el correo no existe u ocurrió un error en la consulta
				if(err.message !== '404'){
					console.log(`[ ERROR ] Ocurrió un error en existeCorreo. ${err.message}`);
				}
				reject(err);
			});
		});
	}
};

module.exports.actualizarPedido = (correo) => {
	if(typeof correo === 'undefined' || correo.length === 0) {
		return Promise.reject(new Error('404'));
	} else {
		//Buscar el pedido activo del cliente y actualizar su costo total
		return database.DB.transaction((t)=>{ //Inicio de transacción
			database.Cliente.findAll({ //Select * from clientes where correo = 'cliente'
				where: {
					correo: correo
				}
			}).then((cliente)=>{
				//Si la consulta fue éxitosa
				if(cliente.length > 0) {
					cliente = cliente[0];
					//Select * from pedidos where clienteID = 'cliente.ID' and estado = 'Carrito'
					database.Pedido.findAll(({
						where: {
							clienteID: cliente.ID,
							estado: 'Carrito'
						}
					})).then((pedido)=>{
						//Si tiene carrito activo, actualizar
						if(pedido.length > 0) {
							pedido = pedido[0];
							//Select * from ordens where pedidoID = 'rows.ID'
							database.Orden.findAll({
								where: { pedidoID: pedido.ID }
							}).then((ordenes)=>{
								if(ordenes.length > 0){
									//Si hay órdenes en el pedido
									let costo = 0.00; 
									let tope = ordenes.length;
									for(let i = 0; i < tope; i++){
										let orden = ordenes.shift();
										costo += parseFloat(orden.costo);
									}
									pedido.updateAttributes({
										costo_total: costo
									}).then(()=>{
										console.log(`[ EXITO ] Pedido actualizado. `);
									}).catch((err)=>{
										throw err;
									});
								} else {
									//Si no hay órdenes en el pedido.
									pedido.updateAttributes({
										costo_total: 0.00
									}).then(()=>{
										console.log(`[ EXITO ] Pedido actualizado. `);
									}).catch((err)=>{
										throw err;
									});
								}
							}).catch((err)=>{
								throw err;
							});
						} else {
							throw new Error('503');
						}
					}).catch((err)=>{
						throw err;
					});
				} else {
					//Si no se encontraron coincidencias
					throw new Error('404');
				}
			}).catch((err)=>{
				//Si ocurrió algún error durante la consulta
				throw err;
			});
		});
	}
};

module.exports.recuperarCarrito = (correo) => {
	//Esa verga funciona
	if(typeof correo === 'undefined' || correo.length === 0) {
		//Si no se ingresa el correo
		return Promise.reject(new Error('404'));
	} else {
		return new Promise((resolve, reject)=>{
			//Buscar el correo del cliente
			module.exports.existeCorreo(correo).then((cliente)=>{
				//Select ID from pedidos where clienteID = 'cliente.ID' and estado = 'Carrito'
				database.Pedido.findOrCreate({
					attributes: ['ID'],
					where: {
						clienteID: cliente.ID,
						estado: 'Carrito'
					}
				}).then((pedido)=>{
					if(!pedido[1]){
						//Si no se creó el pedido, sino que se recuperó.
						database.Orden.findAll({
							attributes: ['modeloID', 'cantidad'],
							where: { 
								pedidoID: pedido[0].ID 
							}, 
							order: [
								[sequelize.col('modeloID'), 'ASC']
							]
						}).then((ordenes)=>{
							let codigos = []; 
							for(let i = 0; i < ordenes.length; i++) {
								codigos.push(ordenes[i].modeloID);
							}

							database.Modelo.findAll({
								attributes: ['codigo'],
								where: {
									ID: { [Op.in]: codigos }
								}
							}).then((modelos)=>{
								let resultado = {
									productos: []
								};
								let tope = modelos.length;
								for(let i = 0; i < tope; i++){
									let producto = modelos.shift();
									resultado.productos.push(producto.codigo);
									resultado[producto.codigo] = ordenes[i].cantidad;
								}
								resolve(resultado);
							}).catch((err)=>{
								console.log(`[ ERROR ] No se pudo consultar una orden. ${err.message}`);
								reject(err);
							});
							
						}).catch((err)=>{
							console.log(`[ ERROR ] No se pudo consultar una orden. ${err.message}`);
							reject(err);
						});
					} else {
						//Si se creó el pedido porque no existía.
						resolve({
							productos: []
						});
					}

				}).catch((err)=>{
					console.log(`[ ERROR ] No se pudo consultar un pedido. ${err.message}`);
					reject(err);
				})
			})
		});
	}
};