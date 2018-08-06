const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const Strings = require('./JS/Files');

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

const upload = multer({
	storage: storage
}).single('imagen');

app.post('/nuevoProducto', (req, res)=>{
	
	upload(req, res, (err) => {
		if(err){
			console.log(`Oops, something went wrong. ${err}`);
		} else {
			console.log(req.file);
			let obj = {
				estado: 'true',
				codigo: 'Test',
				nombre: 'Testing'
			};
			res.end(JSON.stringify(obj));
		}
	});
	/*modelo = {
		codigo: req.body.codigo,
		nombre: req.body.nombre,
		descripcion: req.body.descripcion,
		foto: req.body.imagen,
		precio: req.body.precio,
		cantidad: req.body.cantidad
	};
	Employee.existeModelo(modelo.codigo).then(()=>{
		//Si el código ya existe
		let obj = {
			estado: 'duplicado',
			codigo: modelo.codigo
		}
		res.end(JSON.stringify(obj));
	}).catch((err)=>{
		//Si el código no se ha registrado
		if(!err) {	
			//Si no hubo un error en la consulta anterior
			Employee.postModel(modelo).then((row)=>{
				//Si se pudo agregar el modelo a la BBDD.
				let obj = {
					estado: 'true',
					codigo: row.codigo,
					nombre: row.nombre
				};
				res.end(JSON.stringify(obj));
			}).catch(()=>{
				//Si no se pudo agregar el modelo a la BBDD.
				let obj = {
					estado: 'false'
				};
				res.end(JSON.stringify(obj));
			});
		}
	});*/
});

app.get('/test', (req, res) => {
	res.render('test', {
		clase: 'alert',
		clase2: 'alert-success'
	});
});

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});