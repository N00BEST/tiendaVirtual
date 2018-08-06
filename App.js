const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const Strings = require('./JS/Files');
const fs = require('fs');

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

app.use('/nuevaCategoria', bodyParser.json());
app.use('/nuevaCategoria', bodyParser.urlencoded({extended: false}));

// Public folder with the static documents
app.use(express.static(__dirname + '/Public/'));

// ROUTE TO INDEX 
app.get('/', (req, res) => {
	//res.sendFile(__dirname + '/Public/HTML/index.view.html');
	res.render('index');
});

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
			Employee.agregarModelo(modelo, req.file).then(()=>{
				let obj = {
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
				let obj = {
					clase: 'danger', 
					err: err,
					msg: msg,
					modelo: modelo
				};
				res.render('newProducto', obj);
			});
		}
	});
});

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});