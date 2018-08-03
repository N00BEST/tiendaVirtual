const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');

const app = express();

const __PORT = process.env.PORT || 8000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/nuevoProducto', bodyParser({uploadDir: './Temp/'}));
app.use(express.static(__dirname + '/Public/'));

app.get('/nuevaCategoria', (req, res)=>{
	res.sendFile(__dirname + '/Public/HTML/newCategoria.html');
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
	res.sendFile(__dirname + '/Public/HTML/newProducto.html');
});

app.post('/nuevoProducto', (req, res)=>{
	modelo = {
		codigo: req.body.codigo,
		nombre: req.body.nombre,
		descripcion: req.body.descripcion,
		foto: req.body.imagen,
		precio: req.body.precio,
		cantidad: req.body.cantidad
	};
	Employee.existeModelo(modelo.codigo).then(()=>{
		let obj = {
			estado: 'duplicado',
			codigo: modelo.codigo
		}
		res.end(JSON.stringify(obj));
	}).catch((err)=>{
		if(!err) {	
			Employee.postModel(modelo).then((row)=>{
				let obj = {
					estado: 'true',
					codigo: row.codigo,
					nombre: row.nombre
				};
				res.end(JSON.stringify(obj));
			}).catch(()=>{
				let obj = {
					estado: 'false'
				};
				res.end(JSON.stringify(obj));
			});
		}
	});
});

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});