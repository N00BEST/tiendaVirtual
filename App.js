const express = require('express');
const bodyParser = require("body-parser");
const Employee = require('./JS/EmployeeController');

const app = express();

const __PORT = process.env.PORT || 8000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/nuevaCategoria', express.static(__dirname + '/Public/'));

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

app.listen(__PORT, ()=>{
	console.log(`Server running on port ${__PORT}`);
});