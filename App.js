const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');
const multer = require('multer');
const path = require('path');
const Strings = require('./JS/Files');
const Client = require('./JS/ClientController');
const session = require('express-session');
const files = require('./JS/Files');

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

// Public folder with the static documents
app.use(express.static(__dirname + '/Public/'));

// Inicializar carritos anónimos
app.use((req, res, next) => {
	req.session.carrito = typeof req.session.carrito === 'undefined' ? { productos: [] } : req.session.carrito;
	next();
});

// -------     RUTAS DEL CLIENTE     -------
// ROUTE TO INDEX 
app.get('/', (req, res) => {
	if(typeof req.session.correo === 'undefined'){
		console.log(`[ Carrito Anónimo ] ${JSON.stringify(req.session.carrito)}`);
		res.render('index');
	} else {
		res.render('indexSesion', {
			nombre: req.session.nombre
		})
	}
});

app.get('/Productos', (req, res)=>{
	res.render('productos');
});

app.get('/Busqueda', (req, res)=>{
	Client.buscarProducto(req.query.buscar).then((rows)=>{
		let resultado = [];
		for(let i = 0; i < rows.length; i++){
			let producto = {
				codigo: rows[i].codigo,
				nombre: rows[i].nombre,
				precio: rows[i].precio,
				imagen: rows[i].imagen,
				descripcion: rows[i].descripcion
			}

			resultado.push(producto);
		}
		res.render('busqueda', {
			error: false,
			resultado: resultado,
			busqueda: req.query.buscar.trim()
		});
	}).catch((err)=>{
		console.log(`[ ERROR ] Error al buscar: ${err}`);
		res.render('busqueda', { error: true, busqueda: '' });
	});
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
			res.send('success');
		}).catch((err)=>{
			if(err === 'incorrecta'){
				res.send('password');
			} else if(err === 'no existe') {
				res.send('email');
			} else {
				res.send('error');
			}
		});
	} else {
		res.send('error');
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
					cantidad: req.session.carrito[articulo.codigo]
				}
				resultado.push(modelo);
			}
			res.render('carrito', { 
				error: false,
				Carrito: resultado 
			});
		}).catch((err)=>{
			res.render('carrito', {
				error: true
			});
		});
	} else {
		//Usuario que ya inició sesión. Caso fácil
	}
});

// -------     RUTAS DEL EMPLEADO    -------

app.get('/nuevaCategoria', (req, res)=>{
	//res.sendFile(__dirname + '/Public/HTML/newCategoria.html');
	res.render('newCategoria');
});

app.get('/Admin/NuevoProducto', (req, res)=>{
	Employee.getCategorias().then((rows)=>{
		let resultado = {
			categorias: [],
			error: false
		}
		let tope = rows.length;
		for(let i = 0; i < tope; i++){
			let categoria = rows.shift();
			let nueva = {
				id: categoria.ID
			}
			resultado.categorias.push(nueva);
		}
		res.render('newProducto', resultado);
	}).catch(()=>{
		res.render('newProducto');
	});
});

// CARGAR NUEVAS CATEGORÍAS
app.post('/Admin/NuevaCategoria', (req, res) => {
	let nombre = req.body.nombre.trim();
	let descripcion = req.body.descripcion.trim();
	categoria = {
		nombre: nombre,
		descripcion: descripcion
	};
	Employee.postCategoria(categoria).then(()=>{
		res.end('true');
	}).catch(()=>{
		res.end('false');
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
			publico: req.body.visibilidad
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
				error: false
			}
			let valido = true;
			valido = modelo.codigo.length > 0 && modelo.nombre.length > 0 && !isNaN(modelo.precio) && !isNaN(modelo.cantidad) 
			&& !isNaN(modelo.descuento) && modelo.descuento >= 0 && (visibilidad === 'publico' || visibilidad === 'privado')
			&& modelo.cantidad >= 0 && modelo.precio >= 0 && modelo.cantidad.indexOf('.') === -1;
			if(valido){
				modelo.cantidad = modelo.cantidad === '' ? 0 : modelo.cantidad;
				modelo.precio = modelo.precio === '' ? 0.0 : modelo.precio;
				Employee.agregarModelo(modelo, req.file).then((row)=>{
					obj = {
						producto: modelo
					};

					Employee.getCategorias().then((categorias)=>{
						let tope = categorias.length;
						for(let i = 0; i < tope; i++) {
							let id = categorias.shift().ID;
							if(typeof req.body[id] !== 'undefined'){
								Employee.pertenece(row.ID, id).then(()=>{
									console.log(`[ EXITO ] ${row.ID} agregado a ${id} `);
								}).catch((err)=>{
									console.log(`[ ERROR ] No se pudo asociar ${row.ID} con ${id}. ${err.message} `);
								})
							}
						}
					}).catch((err)=>{});
					console.log(`[ EXITO ] Agregado el modelo ${modelo.codigo}-${modelo.nombre} `);
					res.render('newProducto', obj);
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
						producto: modelo
					};
					console.log(`[ ERROR ] Agregando producto: ${err.message} `);
					res.render('newProducto', obj);
				});
			} else {
				obj = {
					clase: 'danger',
					modelo: modelo, 
					err: 'invalido',
					msg: 'Los datos suministrados son incorrectos.'
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
			if(!err){
				res.send('false');
			} else {
				res.send('error');
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
		Cliente.quitarCarrito(codigo, req.session.correo).then((cantidad)=>{
			//Si se pudo quitar el artículo del carrito.
			//Actualizamos el la cantidad de artículos del carrito
			req.session.carrito[codigo] = cantidad;
			res.sendStatus(200);
		}).else((err)=>{
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

app.get('/producto/:producto', (req, res)=>{
	if(req.params.producto === 'all'){
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
	}
});






// RUTA PARA PRUEBAS
app.get('/test', (req, res)=>{
		res.render('test');
});

app.post('/test', (req, res)=>{
	console.log(req.body.namCat);
	res.send(req.body.nombre);
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