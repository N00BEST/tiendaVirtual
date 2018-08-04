const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');
const multer = require('multer');

const app = express();
const upload = multer({dest: 'Temp/'});

const __PORT = process.env.PORT || 8000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
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

app.post('/nuevoProducto', upload.single('avatar'), (req, res, next)=>{
	modelo = {
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
	});
});

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});