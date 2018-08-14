const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');
const multer = require('multer');
const path = require('path');
const Strings = require('./JS/Files');
const Client = require('./JS/ClientController');
const session = require('express-session');
const files = require('./JS/Files');
const favicon = require('serve-favicon');

const app = express();

const __PORT = process.env.PORT || 8000;

// View Engine
app.set('view engine', 'ejs');
// Routes Case Sentive
app.set('case sensitive routing', true);

// Storage Engine to Uploads
const storage = multer.diskStorage({
	destination: './Temp/',
	filename: (req, file, cb) => {
		cb(null, Strings.genRandomName(10) + path.extname(file.originalname));
	}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({ secret: files.genRandomName(20), saveUninitialized: true, resave: false }));
app.use(favicon(__dirname + '/Public/IMG/icono/tag.png'));

// Public folder with the static documents
app.use(express.static(__dirname + '/Public/'));

// Inicializar carritos anónimos
app.use((req, res, next) => {
	req.session.carrito = typeof req.session.carrito === 'undefined' ? { productos: [] } : req.session.carrito;
	next();
});

// Contabilizar visitas a las categorías
app.use('/Categoria/:nombre', (req, res, next) => {
	Client.existeCategoria(req.params.nombre).then((categoria)=>{
		Employee.visitarCategoria(categoria.ID).then(()=>{}).catch((err)=>{
			console.log(`[ ERROR ] No se pudo contar la visita a la categoría ${categoria.nombre}. ${err.msg} `);
		});
	}).catch((err)=>{});
	next();
});

// -------     RUTAS DEL CLIENTE     -------
// ROUTE TO INDEX 
app.get('/', (req, res) => {
	Client.buscarMejoresCategorias().then((categorias)=>{
		let resultado = [];
		for(let i = 0; i < categorias.length; i++) {
			let categoria = {
				id: categorias[i].ID,
				nombre: categorias[i].nombre,
				descripcion: categorias[i].descripcion,
				imagen: categorias[i].imagen
			}
			resultado.push(categoria);
		}
		console.log(categorias);
		if(typeof req.session.correo === 'undefined'){	
			res.render('index', {
				categorias: resultado
			});
		} else {
			res.render('indexSesion', {
				nombre: req.session.nombre,
				categorias: resultado
			});
		}
	}).catch((err)=>{
		console.log(`[ ERROR ] Hubo un error al buscar mejores categorías. ${err.message} `);
		res.render('500');
	});
});

app.get('/Productos', (req, res)=>{
	res.render('productos', {
		nombre: req.session.nombre
	});
});

app.get('/Busqueda', (req, res)=>{
	if(typeof req.query.buscar !== 'undefined'){
		Client.buscarProducto(req.query.buscar).then((rows)=>{
			let resultado = [];
			for(let i = 0; i < rows.length; i++){
				let producto = {
					codigo: rows[i].codigo,
					nombre: rows[i].nombre,
					precio: rows[i].precio,
					imagen: rows[i].imagen,
					descripcion: rows[i].descripcion,
					disponible: rows[i].cantidad > 0
				}

				resultado.push(producto);
			}
			res.render('busqueda', {
				error: false,
				resultado: resultado,
				busqueda: req.query.buscar.trim(), 
				nombre: req.session.nombre
			});
		}).catch((err)=>{
			console.log(`[ ERROR ] Error al buscar: ${err}`);
			res.render('busqueda', { error: true, busqueda: '', nombre: req.session.nombre });
		});
	} else {
		res.redirect('/Productos');
	}
});

app.get('/Registrarse', (req, res)=>{
	if(typeof req.session.correo === 'undefined'){
		res.render('registrarse');
	} else {
		res.redirect('/');
	}
});

app.post('/Registrarse', (req, res)=>{
	
	/* 
		Nombre, Apellido, Correo, Teléfono, Cédula, Dirección, Nacimiento, Contraseña y Recontraseña
	*/
	let cliente = {
		nombre: req.body.nombre,
		apellido: req.body.apellido,
		correo:	req.body.correo,
		telefono: req.body.telefono,
		cedula: req.body.cedula,
		direccion: req.body.direccion,
		password: req.body.pass
	}
	if(req.body.nacimiento.length > 0) {
		cliente.nacimiento = req.body.nacimiento;
	}
	if(cliente.password === req.body.pass2){
		Client.agregarCliente(cliente).then(()=>{
			res.contentType('text/plain');
			req.session.correo = cliente.correo;
			req.session.nombre = cliente.nombre;
			res.send('success');
		}).catch((err)=>{
			if(err === 'duplicado'){
				res.contentType('text/plain');
				res.send('email');
			} else {
				res.send('error');
			}
		});
	} else {
		res.contentType('text/plain');
		res.send('passwords');
	}
});

app.get('/Login', (req, res)=>{
	if(typeof req.session.correo === 'undefined'){
		res.render('login');
	} else {
		res.redirect('/');
	}
});

app.post('/Login', (req, res)=>{
	res.contentType('text/plain');
	if(typeof req.session.correo === 'undefined'){
		let cliente = {
			correo: req.body.correo,
			password: req.body.pass
		};
		Client.iniciarSesion(cliente).then((client)=>{
			req.session.correo = client.correo;
			req.session.nombre = client.nombre;
			Client.sincronizarCarrito(req.session.carrito, client.correo).then(()=>{
				Client.actualizarPedido(client.correo);
			}).catch((err)=>{});
			let url = req.header('Referer') || '/';
			res.send(url);
		}).catch((err)=>{
			if(err === 'incorrecta'){
				res.sendStatus(401);
			} else if(err === 'no existe') {
				res.sendStatus(404);
			} else {
				console.log(`[ ERROR ] Al iniciar sesión. ${err.message} `);
				res.sendStatus(500);
			}
		});
	} else {
		res.sendStatus(500);
	}
});

app.get('/MiCarrito', (req, res)=>{
	if(typeof req.session.correo === 'undefined'){
		//Usuario que no ha iniciado sesión.
		//Recuperar artículos desde la base de datos, armar resultado
		//Desplegar resultado en vista
		let resultado = [];
		Client.getCarrito(req.session.carrito.productos).then((rows)=>{
			let tope = rows.length;
			for(let i = 0; i < tope; i++) {
				let articulo = rows.shift();
				let modelo = {
					codigo: articulo.codigo, 
					nombre: articulo.nombre,
					precio: articulo.precio,
					imagen: articulo.imagen,
					descripcion: articulo.descripcion,
					cantidad: req.session.carrito[articulo.codigo], 
					disponible: articulo.cantidad > 0
				}
				resultado.push(modelo);
			}
			res.render('carrito', { 
				error: false,
				Carrito: resultado, 
				nombre: req.session.nombre
			});
		}).catch((err)=>{
			res.render('carrito', {
				error: true
			});
		});
	} else {
		//Usuario que ya inició sesión. Caso fácil
		Client.recuperarCarrito(req.session.correo).then((carrito)=>{
			req.session.carrito = carrito;
			Client.getCarrito(req.session.carrito.productos).then((rows)=>{
				let resultado = [];
				let tope = rows.length;
				for(let i = 0; i < tope; i++) {
					let articulo = rows.shift();
					let modelo = {
						codigo: articulo.codigo, 
						nombre: articulo.nombre,
						precio: articulo.precio,
						imagen: articulo.imagen,
						descripcion: articulo.descripcion,
						cantidad: req.session.carrito[articulo.codigo],
						disponible: articulo.cantidad > 0
					}
					resultado.push(modelo);
				}
				res.render('carrito', { 
					error: false,
					Carrito: resultado, 
					nombre: req.session.nombre
				});
			}).catch((err)=>{
				console.log(`[ ERROR ] Ocurrió un error accediendo al carrito. ${err} `);
				res.render('carrito', {
					error: true, 
					nombre: req.session.nombre
				});
			});
		}).catch((err)=>{
			console.log(`[ ERROR ] Ocurrió un error accediendo al carrito. ${err} `);
			res.render('carrito', {
				error: true,
				nombre: req.session.nombre
			});
		});
	}
});

app.get('/Producto/:codigo', (req, res)=>{
	Client.getProducto(req.params.codigo).then((producto)=>{
		let resultado = {
			codigo: producto.codigo,
			nombre: producto.nombre,
			imagen: producto.imagen,
			precio: producto.precio,
			descripcion: producto.descripcion,
			disponible: producto.cantidad > 0
		}
		res.render('detallesProducto', {
			producto: resultado
		});
	}).catch((err)=>{
		if(err.message !== '404'){
			console.log(`[ ERROR ] Ocurrió un error consultando un producto. ${err.message} `);
		}
		res.render('404');
	})
	
});

app.get('/AcercaDe', (req, res)=>{
	res.render('acerca', {
		nombre: req.session.nombre
	});
});

//Esta ruta está incompleta
app.get('/Categoria/:nombre', (req, res) =>{
	Client.existeCategoria(req.params.nombre).then((categoria)=>{
		Client.getProductosCategoria(categoria.ID).then((productos)=>{
			res.render('categoria', {
				error: false,
				categoria: categoria,
				productos: productos
			});
		}).catch((err)=>{
			switch(err.message){
				case '404': 
					res.render('404');
				break;
	
				default:
					res.render(500);
				break;
			}
		})
	}).catch((err)=>{
		switch(err.message){
			case '404': 
				res.render('404');
			break;

			default:
				res.render(500);
			break;
		}
	});
});

app.get('/Categorias', (req, res)=>{
	Client.getCategorias().then((categorias)=>{
		res.render('categorias', {
			categorias: categorias
		});
	}).catch((err)=>{
		switch(err.message){
			default:
				console.log(`[ ERROR ] Ocurrió un error intentando acceder a /Categorias. ${err.message} `);
				res.render('500');
			break;
		}
	});
});

// -------     RUTAS DEL EMPLEADO    -------

app.get('/Admin/NuevaCategoria', (req, res)=>{
	if(typeof req.session.rol !== 'undefined'){
		res.render('newCategoria', {
			error: false,
			msg: '',
			nombre: req.session.nombre
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin/NuevoProducto', (req, res)=>{
	if(typeof req.session.rol !== 'undefined'){
		Employee.getCategorias().then((rows)=>{
			let resultado = {
				categorias: [],
				error: false, 
				nombre: req.session.nombre
			}
			let tope = rows.length;
			for(let i = 0; i < tope; i++){
				let categoria = rows.shift();
				let nueva = {
					id: categoria.ID, 
					nombre: categoria.nombre,
				}
				resultado.categorias.push(nueva);
			}
			res.render('newProducto', resultado);
		}).catch(()=>{
			res.render('newProducto');
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin', (req, res)=>{
	if(typeof req.session.rol !== 'undefined') {
		res.render('escritorio', {
			nombre: req.session.nombre
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin/Categorias', (req, res)=>{
	if(typeof req.session.rol !== 'undefined'){
		res.render('adminCategorias', {
			nombre: req.session.nombre
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin/Categoria/:cat', (req, res)=>{
	if(typeof req.session.rol !== 'undefined'){
		Employee.getCategoria(req.params.cat).then((categoria)=>{
			res.render('modificarCategoria', {
				nombre: req.session.nombre, 
				categoria: categoria
			});
		}).catch((err)=>{
			console.log(`[ ERROR ] Ocurrió un error obteniendo categoría. ${err.message} `);
			res.render('500');
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin/Producto/:codigo', (req, res)=>{
	if(typeof req.session.rol !== 'undefined') {
		Employee.existeModelo(req.params.codigo).then((modelo)=>{
			Employee.getCategorias().then((categorias)=>{
				let producto = {
					codigo: modelo.codigo,
					nombre: modelo.nombre,
					imagen: modelo.imagen, 
					precio: modelo.precio,
					publico: modelo.publico,
					descripcion: modelo.descripcion
				}
				res.render('modificarProducto', {
					nombre: req.session.nombre,
					producto: producto, 
					exito: true,
					error: false,
					msg: '', 
					categorias: categorias
				});
			}).catch((err)=>{
				console.log(`[ ERROR ] Ocurrió un error: ${err.message} `);
				res.render('500');
			});
		}).catch((err)=>{
			switch(err){
				case null: 
					res.render('404');
				break;
				
				default: 
					console.log(`[ ERROR ] Ocurrió un error: ${err.message} `);
					res.render('500');
				break;
			}
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin/Productos', (req, res)=>{
	if(typeof req.session.rol !== 'undefined'){
		res.render('buscarProducto', {
			nombre: req.session.nombre
		});
	} else {
		res.render('404');
	}
});

app.get('/Admin/Login', (req, res)=>{
	if(typeof req.session.rol === 'undefined'){
		res.render('adminLogin');
	} else {
		res.redirect('/Admin');
	}
});

app.get('/Admin/NuevoEmpleado', (req, res)=>{

	if(typeof req.session.rol !== 'undefined' && req.session.rol === 'Admin'){
		res.render('nuevoEmpleado', {
			nombre: req.session.nombre
		});
	} else {
		res.render('404');
	}
});

// ------     RUTAS TIPO API      -------

// CARGAR NUEVAS CATEGORÍAS
app.post('/Admin/NuevaCategoria', (req, res) => {
	const upload = multer({
		storage: storage,
		limits: {
					fileSize: 1 * 1000000 // 1 MB
				},
		fileFilter: (req, file, cb) =>{
			Employee.validarImagen(file, cb);
		}
	}).single('imagen');
	upload(req, res, (err)=>{
		if(err){
			err = err.message === 'File too large' ? 'La imagen es muy pesada' : err;
			let obj = {
				error: true, 
				msg: err
			}
			res.render('newCategoria', obj);
		} else {
			let categoria = {
				nombre: req.body.nombre,
				descripcion: req.body.descripcion,
				imagen: 'default.png'
			}
			if(categoria.nombre.length > 0 && categoria.descripcion.length <= 500){
				Employee.agregarCategoria(categoria, req.file).then(()=>{
					let obj = {
						error: false,
						msg: `La categoría "${categoria.nombre}" fue agregada éxitosamente.`, 
						nombre: req.session.nombre
					}
					res.render('newCategoria', obj);
				}).catch((err)=>{
					let obj = {
						error: true,
						msg: '',
						nombre: req.session.nombre
					}
					switch(err.message){
						default: 
							console.log(`[ ERROR ] No se pudo agregar la categoría. ${err.message} `);
							obj.msg = ('Ocurrió un error, por favor intente de nuevo más tarde.');
						break;
					}
					res.render('newCategoria', obj);
				});
			} else {
				let obj = {
					error: true,
					msg: categoria.nombre.length === 0 ? 'El nombre no puede estar vacío' : 'La descripción no puede tener más de 500 caracteres',
					nombre: req.session.nombre
				};

				res.render('newCategoría', obj);
			}
		}
	});
});

// CARGAR NUEVOS PRODUCTOS
app.post('/Admin/NuevoProducto', (req, res)=>{
	const upload = multer({
		storage: storage,
		limits: {
					fileSize: 1 * 1000000 // 1 MB
				},
		fileFilter: (req, file, cb) =>{
			Employee.validarImagen(file, cb);
		}
	}).single('imagen');
	upload(req, res, (err) => {
		let modelo = {
			codigo: req.body.codigo,
			nombre: req.body.nombre,
			descripcion: req.body.descripcion,
			imagen: 'default.jpg',
			precio: req.body.precio,
			cantidad: req.body.cantidad,
			descuento: req.body.descuento,
			publico: req.body.visibilidad === 'publico'
		};
		if(err) {
			err = err == 'Error: File too large' ? 'La imagen es muy pesada' : err;
			let obj = {
				clase: 'alert-danger', 
				error: true,
				msg: err
			}
			res.render('newProducto', obj);
		} else {
			//VALIDAR CAMPOS DEL MODELO
			let obj = {
				clase: '', 
				producto: modelo,
				msg: '', 
				error: false,
				nombre: req.session.nombre
			}
			let valido = true;
			valido = modelo.codigo.length > 0 && modelo.nombre.length > 0 && !isNaN(modelo.precio) && !isNaN(modelo.cantidad) 
			&& !isNaN(modelo.descuento) && modelo.descuento >= 0 && (req.body.visibilidad === 'publico' || req.body.visibilidad === 'privado')
			&& modelo.cantidad >= 0 && modelo.precio >= 0 && modelo.cantidad.indexOf('.') === -1;
			if(valido){
				modelo.cantidad = modelo.cantidad === '' ? 0 : modelo.cantidad;
				modelo.precio = modelo.precio === '' ? 0.0 : modelo.precio;
				modelo.descuento = modelo.descuento === '' ? 0.0 : modelo.descuento;
				Employee.agregarModelo(modelo, req.file).then((row)=>{
					obj = {
						error: false,
						nombre: req.session.nombre,
						exito: true,
						msg: `El producto ${modelo.codigo} - "${modelo.nombre}" fue agregado con éxito`
					};

					Employee.getCategorias().then((categorias)=>{
						let tope = categorias.length;
						for(let i = 0; i < tope; i++) {
							let id = categorias.shift();
							id = id.ID;
							obj.categorias.push({
								id: id.ID,
								nombre: id.nombre
							});
							if(typeof req.body[id] !== 'undefined'){
								Employee.pertenece(row.ID, id).then(()=>{
									console.log(`[ EXITO ] ${row.ID} agregado a ${id} `);
								}).catch((err)=>{
									console.log(`[ ERROR ] No se pudo asociar ${row.ID} con ${id}. ${err.message} `);
								})
							}
						}
					}).catch((err)=>{
						console.log(`[ ERROR ] Al intentar consultar las categorías. ${err.message} `);
					});
					Employee.getCategorias().then((rows)=>{
						let resultado = {
							categorias: [],
							error: false,
							exito: true,
							msg: `El producto ${modelo.codigo} - "${modelo.nombre}" fue agregado exitosamente.`
						}
						let tope = rows.length;
						for(let i = 0; i < tope; i++){
							let categoria = rows.shift();
							let nueva = {
								id: categoria.ID, 
								nombre: categoria.nombre,
							}
							resultado.categorias.push(nueva);
						}
						res.render('newProducto', resultado);
					}).catch((err)=>{
						console.log(`[ ERROR ] Al intentar consultar las categorías. ${err.message} `);
						res.render('500');
					});
				}).catch((err)=>{
					let msg = '';
					if(err != 'duplicado') {
						msg = 'Error: El código ya está registrado.';
						err = true;
					} else{
						msg = 'Error: No se pudo agregar el producto.';
						err = true;
					}
					obj = {
						error: err,
						msg: msg,
						producto: modelo,
						nombre: req.session.nombre
					};
					console.log(`[ ERROR ] Agregando producto: ${err.message} `);
					res.render('newProducto', obj);
				});
			} else {
				obj = {
					clase: 'danger',
					producto: modelo, 
					error: true,
					msg: 'Error: Los datos suministrados son incorrectos.',
					nombre: req.session.nombre
				}
				res.render('newProducto', obj);
			}
		}
	});
});

// VALIDAR SI UN CÓDIGO YA ESTÁ REGISTRADO 
app.post('/check/:cod', (req, res)=> {
	res.contentType('text/plain');
	if(req.params.cod.length > 0) {
		Employee.existeModelo(req.params.cod).then(()=>{
			res.end('invalido');
		}).catch((err)=>{
			if(!err){
				res.end('valido');
			} else {
				res.end('invalido');
			}
		});
	} else {
		res.end('vacio');
	}
});

// VALIDAR SI UN CORREO O UNA CÉDULA YA ESTÁN REGISTRADOS
app.get('/exists/:string', (req, res)=>{
	res.contentType('text/plain');
	if(/^([VEJPG])?\d{7,9}$/g.test(req.params.string)){
		Client.existeCedula(req.params.string.trim()).then(()=>{
			res.send('true');
		}).catch((err)=>{
			if(!err){
				res.send('false');
			} else {
				res.send('error');
			}
		});
	} else if(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g.test(req.params.string)) {
		Client.existeCorreo(req.params.string.trim()).then(()=>{
			res.send('true');
		}).catch((err)=>{
			switch(err.message){
				case '404':
					res.send('false');		
				break;

				default:
					console.log(`[ ERROR ] Ocurrió un error verificando la existencia de un correo: ${err.message} `);
					res.send('error');
				break;
			}
		});
	} else {
		res.send('error');
	}
});

// AGREGAR UN PRODUCTO AL CARRITO
app.post('/agregar/:cod', (req, res)=>{
	let codigo = req.params.cod;
	if(typeof req.session.correo === 'undefined'){
		//Si es un usuario anónimo
		if(typeof req.session.carrito[codigo] === 'undefined'){
			Client.alCarrito(codigo).then(()=>{
				req.session.carrito[codigo] = 1;
				req.session.carrito.productos.push(codigo);
				res.send(`${req.session.carrito[codigo]}`);
			}).catch((err)=>{
				switch(err.message){
					case '404':
						res.sendStatus(404);
					break;

					case 'no':
						res.sendStatus(503);
					break;

					default:
						res.sendStatus(500);
					break;
				}
			})
		} else {
			req.session.carrito[codigo]++;
			res.send(`${req.session.carrito[codigo]}`);
		}
	} else {
		//Si el usuario está loggeado
		Client.alCarrito(codigo, req.session.correo).then((cantidad)=>{
			//Si se pudo agregar el artículo al carrito
			//Actualizar cantidad del artículo en el carrito
			req.session.carrito[codigo] = cantidad;
			res.send(`${req.session.carrito[codigo]}`);
		}).catch((err)=>{
			switch(err){
				case '404': 
					//Si el artículo a agregar no existe.
					res.sendStatus(404);
				break;

				case 'no':
					//Si el artículo no está disponible para agregarlo
					res.sendStatus(503);
				break;

				default: 
					//Si ocurrió algún error interno del servidor
					console.log(`[ ERROR ] En agregar al carrito con usuario loggeado ${err}`);
					res.sendStatus(500);
				break;
			}
		});
	}
	
});

// QUITAR UN PRODUCTO DEL CARRITO
app.post('/quitar/:cod', (req, res)=>{
	let codigo = req.params.cod;

	if(typeof req.session.carrito[codigo] === 'undefined' || req.session.carrito[codigo] === 0) {
		//Si el usuario no tiene ese producto en el carrito o tiene 0 artículos de ese producto
		//Retornas servicio no disponible
		res.sendStatus(503);
	} else if(typeof req.session.correo === 'undefined'){
		//Si es un usuario anónimo
		Client.quitarCarrito(codigo).then(()=>{
			//Si se pudo retirar el artículo del carrito
			let response = req.session.carrito[codigo] - 1;
			if(response === 0){
				req.session.carrito[codigo] = undefined;
				let index = req.session.carrito.productos.indexOf(codigo);
				if(index > -1) {
					req.session.carrito.productos.splice(index, 1);
				} 
			} else {
				req.session.carrito[codigo] = response;
			}
			res.send(`${response}`);
		}).catch((err)=>{
			switch(err.message){
				case '404': 
					//Si el producto no existe
					res.sendStatus(404);
					break;
				default: 
					//Si ocurrió algún error del servidor
					console.log(`[ ERROR ] Al quitar artículo de carro anónimo: ${err.message} `);
					res.sendStatus(500);
					break;
			}
		});
	} else {
		//Si es un usuario loggeado
		Client.quitarCarrito(codigo, req.session.correo).then((cantidad)=>{
			//Si se pudo quitar el artículo del carrito.
			//Actualizamos el la cantidad de artículos del carrito
			req.session.carrito[codigo] = cantidad;
			res.contentType('text/plain');
			console.log('Cantidad: ' + cantidad);
			res.send(`${cantidad}`);
		}).catch((err)=>{
			switch(err){
				case '404':
					//Si el artículo a retirar no existe
					res.sendStatus(404);
				break;

				default: 
					//Si ocurrió algún error interno
					res.sendStatus(500);
				break;
			}
		});
	}
});

// OBTENER INFORMACIÓN SOBRE UN PRODUCTO
app.get('/producto/:producto', (req, res)=>{
	/*if(req.params.producto === 'all'){
			//res.contentType = 'application/json';
			Client.getProductos().then((row)=>{
				let resultado = [];
				row.forEach(p => {
					let obj = {
						codigo: p.codigo, 
						nombre: p.nombre, 
						precio: p.precio, 
						disponible: p.cantidad > 0, 
						imagen: p.imagen, 
						descripcion: p.descripcion
					};
					resultado.push(obj);
				});
				res.send(resultado);
			}).catch((err)=>{
				res.send(err);
			});
	} else {
		Client.getProducto(req.params.producto).then((producto)=>{
			if(producto.publico){
				let resultado = {
					codigo: producto.codigo,
					nombre: producto.nombre,
					imagen: producto.imagen,
					descripcion: producto.descripcion,
					precio: producto.precio,
					disponible: producto.cantidad > 0
				};
				res.send(resultado);
			} else {
				res.sendStatus(404);
			}
		}).catch((err)=>{
			res.sendStatus(404);
		});
	}*/

	if(req.params.producto === 'all'){
		Employee.getProductos().then((productos)=>{
			res.send(productos);
		}).catch((err)=>{
			console.log(`[ ERROR ] Ocurrió un error intentando recuperar todos los productos. ${err.message} `);
			res.sendStatus(500);
		});
	}
});

// OBTENER INFORMACIÓN DE UNA CATEGORÍA RUTA SÓLO PARA EMPLEADOS
app.get('/categoria/:cat', (req, res)=>{
	if(req.params.cat === 'all'){
		Employee.getCategorias().then((categorias)=>{
			let resultado = [];
			let tope = categorias.length;
			for(let i = 0; i < tope; i++) {
				let categoria = categorias.shift();
				let insert = {
					id: categoria.ID,
					nombre: categoria.nombre,
					descripcion: categoria.descripcion
				}
				resultado.push(insert);
			}
			res.send(resultado);
		}).catch((err)=>{
			console.log('[ ERROR ] Al consultar las categorias. ' + err.message);
			res.sendStatus(500);
		});
	} else {
		Employee.getProductosCategoria(req.params.cat).then((productos)=>{
			let resultado = [];
			let tope = productos.length;
			for(let i = 0; i < tope; i++) {
				let producto = productos.shift();
				resultado.push({
					codigo: producto.codigo,
					nombre: producto.nombre
				});
			}
			res.send(resultado);
		}).catch((err)=>{
			switch(err.message){
				case '404': 
					res.sendStatus(404);
				break;

				case '400': 
					res.sendStatus(400);
				break;

				default: 
					console.log(`[ ERROR ] Error al buscar categoría tipo API. ${err.message} `);
					res.sendStatus(500);
				break;
			}
		});
	}
});

// CERRAR SESSIÓN
app.get('/Logout', (req, res)=>{
	if(typeof req.session.correo !== 'undefined'){
		req.session.regenerate((err)=>{
			res.redirect('/');
		});
	} else {
		res.redirect('/');
	}
});

app.get('/nuevos/:cat', (req, res)=>{
	if(typeof req.params.cat === 'undefined' || isNaN(req.params.cat)){
		res.sendStatus(400);
	} else {
		Client.buscarRecientes(req.params.cat).then((productos)=>{
			let resultado = [];
			let tope = productos.length;
			for(let i = 0; i < tope; i++) {
				let producto = productos.shift();
				let obj = {
					nombre: producto.nombre,
					codigo: producto.codigo,
					precio: producto.precio,
					imagen: producto.imagen,
					descripcion: producto.descripcion,
					disponible: producto.cantidad > 0
				}
				resultado.push(obj);
			}
			res.send(resultado);
		}).catch((err)=>{
			switch(err.message){
				default: 
					console.log(`[ ERROR ] Error al buscar los productos recientes de ${req.params.cat}. ${err.message} `);
					res.sendStatus(500);
				break;
			}
		});
	}
});

app.get('/admin/exists/:correo', (req, res)=>{
	if(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g.test(req.params.correo)){
		Employee.existeCorreo(req.params.correo).then(()=>{
			res.sendStatus(200);
		}).catch((err)=>{
			switch(err.message){
				case '404': 
					res.sendStatus(404);
				break;

				case '400': 
					res.sendStatus(400);
				break;

				default: 
					console.log(`[ ERROR ] Al consultar correo. ${err.message} `);
					res.sendStatus(500);
				break;
			}
		});
	} else {
		res.sendStatus(404);
	}
});

app.post('/nuevoEmpleado', (req, res)=>{
	if(!/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g.test(req.body.correo) || 
		req.body.pass !== req.body.pass2 || req.body.pass.length < 8 || !/^(Administrador|Gerente|Vendedor)$/i.test(req.body.rol)){
		
		res.contentType('text/plain');
		if(req.body.pass !== req.body.pass2){
			res.send('no match');
		} else if(req.body.pass.length < 8) {
			res.send('too short');
		} else if(!/^(Administrador|Gerente|Vendedor)$/i.test(req.body.rol)){
			res.send('invalid rol');
		} else {
			res.sendStatus(400);
		}
	} else {
		Employee.existeCorreo(req.body.correo).then(()=>{
			res.contentType('text/plain');
			res.send('email in use');
		}).catch((err)=>{
			if(err.message === '404'){
				let empleado = {
					correo: req.body.correo,
					password: req.body.pass,
					rol: req.body.rol,
					nombre: req.body.rol,
					apellido: req.body.apellido
				}
				Employee.postEmpleado(empleado).then(()=>{
					console.log(`[ EXITO ] Se ha creado un empleado ${empleado.rol} nuevo`);
					res.sendStatus(200);
				}).catch((err)=>{
					console.log(`[ ERROR ] Ocurrió un error creando un empleado. ${err.message} `);
					res.sendStatus(500);
				});
			} else {
				switch(err.message) {
					case '400': 
						res.sendStatus(400);
					break;

					default: 
						console.log(`[ ERROR ] Ocurrió un error verificando un correo de empleado. ${err.message} `);
						res.sendStatus(500);
					break;
				}
			}
		});
			
	}
});

app.post('/admin/login', (req, res)=> {
	if(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g.test(req.body.correo) || req.body.pass.length < 8){
		Employee.existeCorreo(req.body.correo).then((empleado)=>{
			Employee.login(req.body.correo, req.body.pass).then(()=>{
				req.session.nombre = empleado.nombre;
				req.session.apellido = empleado.apellido;
				req.session.correo = empleado.correo;
				req.session.rol = empleado.rol;
				res.send("/Admin");
			}).catch((err)=>{
				switch(err.message){
					case '401': 
						res.sendStatus(401);
					break;

					default: 
						console.log(`[ ERROR ] Ocurrió un error intentando iniciar sesión. ${err.message}`);
						res.sendStatus(500);
					break;
				}
			});
		}).catch((err)=>{
			switch(err.message){
				case '404': 
					res.sendStatus(400);
				break;

				case '400': 
					res.sendStatus(400);
				break;

				default: 
					console.log(`[ ERROR ] Ocurrió un error intentando iniciar sesión. ${err.message}`);
					res.sendStatus(500);
				break;
			}
		});
	} else {
		res.sendStatus(400);
	}
});





// RUTA PARA PRUEBAS
app.get('/test', (req, res)=>{
		res.render('test');
});

app.post('/test', (req, res)=>{
	console.log(req.header('Referer'));
	res.send(req.header);
});

// DESPLEGAR PÁGINA DE 404
app.get('*', (req, res)=>{
	res.render('404');
});

app.post('*', (req, res)=>{
	res.sendStatus(404);
})

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});