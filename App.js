const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');
const multer = require('multer');
const path = require('path');
const Strings = require('./JS/Files');
const Client = require('./JS/ClientController');

const app = express();

const __PORT = process.env.PORT || 8000;

// View Engine
app.set('view engine', 'ejs');

// Storage Engine to Uploads
const storage = multer.diskStorage({
	destination: './Temp/',
	filename: (req, file, cb) => {
		cb(null, Strings.genRandomName(10) + path.extname(file.originalname));
	}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Public folder with the static documents
app.use(express.static(__dirname + '/Public/'));

// -------     RUTAS DEL CLIENTE     -------
// ROUTE TO INDEX 
app.get('/', (req, res) => {
	//res.sendFile(__dirname + '/Public/HTML/index.view.html');
	res.render('index');
});

app.get('/Producto/:producto', (req, res)=>{
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
					nombre: producto.nombre,
					imagen: '../' + producto.imagen,
					descripcion: producto.descripcion,
					precio: producto.precio,
					disponible: producto.cantidad > 0
				};
				res.render('detallesProducto', resultado);
			} else {
				res.render('404');
			}
		}).catch((err)=>{
			res.render('404');
		});
	}
});

app.get('/Productos', (req, res)=>{
	res.render('productos');
});

app.post('/Busqueda', (req, res)=>{
	Client.buscarProducto(req.body.buscar).then((rows)=>{
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
			busqueda: req.body.buscar
		});
	}).catch((err)=>{
		console.log(`[ ERROR ] Error al buscar: ${err}`);
		res.render('busqueda', { error: true, busqueda: '' });
	});
});

// -------     RUTAS DEL EMPLEADO    -------

// ------- INICIO DE NUEVA CATEGORIA -------

app.get('/nuevaCategoria', (req, res)=>{
	//res.sendFile(__dirname + '/Public/HTML/newCategoria.html');
	res.render('newCategoria');
});

app.post('/nuevaCategoria', (req, res) => {
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

// -------   FIN DE NUEVA CATEGORIA  -------

// ------- INICIO DE NUEVO PRODUCTO -------

app.get('/nuevoProducto', (req, res)=>{
	//res.sendFile(__dirname + '/Public/HTML/newProducto.html');
	res.render('newProducto');
});

app.post('/nuevoProducto', (req, res)=>{
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
			cantidad: req.body.cantidad
		};
		if(err) {
			err = err == 'Error: File too large' ? 'La imagen es muy pesada' : err;
			let obj = {
				clase: 'danger', 
				err: 'imagen',
				msg: err
			}
			res.render('newProducto', obj);
		} else {
			//VALIDAR CAMPOS DEL MODELO
			let obj = {
				clase: '', 
				modelo: modelo,
				msg: '', 
				err: null
			}
			let valido = true;
			valido = modelo.codigo.length > 0 && modelo.nombre.length > 0 && !isNaN(modelo.precio) && !isNaN(modelo.cantidad) 
			&& modelo.cantidad >= 0 && modelo.precio >= 0 && modelo.cantidad.indexOf('.') === -1;
			if(valido){
				modelo.cantidad = modelo.cantidad === '' ? 0 : modelo.cantidad;
				modelo.precio = modelo.precio === '' ? 0.0 : modelo.precio;
				Employee.agregarModelo(modelo, req.file).then(()=>{
					obj = {
						clase: 'success',
						modelo: modelo
					};
					res.render('newProducto', obj);
				}).catch((err)=>{
					let msg = '';
					if(err != 'duplicado') {
						msg = err;
						err = 'Error';
					}
					obj = {
						clase: 'danger', 
						err: err,
						msg: msg,
						modelo: modelo
					};
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

// -------   FIN DE NUEVO PRODUCTO  -------

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





// DESPLEGAR PÁGINA DE 404
app.get('*', (req, res)=>{
	res.render('404');
});


// RUTA PARA PRUEBAS
app.get('/test', (req, res)=>{
	res.render('test');
});

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});