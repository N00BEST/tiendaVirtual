const Sequelize = require('sequelize');

const database = new Sequelize('tiendaTest', 'empleado', 'randomPass', {
	host: 'localhost',
	dialect: 'mysql',
	operatorsAliases: false,
	pool: {
		max: 100,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	logging: false
});

//Color (id, nombre)
const Color = database.define('color', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true		
	},
	nombre: {
		type: Sequelize.STRING(20)
	}
});

//Cliente (id, user, pw, nombre, apellido, edad, sexo, direccion, telefono, correo)
const Cliente = database.define('cliente', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	}, 
	user: {
		type: Sequelize.STRING(10),
		unique: true,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING(64),
		allowNull: false
	},
	correo: {
		type: Sequelize.STRING(50),
		unique: true,
		allowNull: false
	},
	nombre: {
		type: Sequelize.STRING(100)
	},
	apellido: {
		type: Sequelize.STRING(100)
	},
	edad: {
		type: Sequelize.SMALLINT(3)
	},
	sexo: {
		type: Sequelize.ENUM('M', 'F'),
		defaultValue: 'M'
	},
	direccion: {
		type: Sequelize.STRING(200),
		defaultValue: ''
	},
	telefono: {
		type: Sequelize.STRING(15),
		defaultValue: ''
	}
});

//Modelo (id, codigo, nombre, descripcion, foto, precio, descuento, cantidad, genero)
const Modelo = database.define('modelo', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	codigo: {
		type: Sequelize.STRING(20),
		unique: true,
		allowNull: false
	},
	nombre: {
		type: Sequelize.STRING(100)
	},
	descripcion: {
		type: Sequelize.TEXT,
		defaultValue: ''
	},
	foto: {
		type: Sequelize.STRING, 
		defaultValue: ''
	},
	precio: {
		type: Sequelize.DECIMAL(10, 2)
	},
	descuento: {
		type: Sequelize.DECIMAL(5, 2),
		defaultValue: 0
	},
	cantidad: {
		type: Sequelize.INTEGER.UNSIGNED,
		defaultValue: 0
	}, 
	genero: {
		type: Sequelize.ENUM('M', 'F', 'NA'),
		defaultValue: 'NA'
	}
});

//Categoria (id, nombre, descripcion)
const Categoria = database.define('categoria', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	},
	nombre: {
		type: Sequelize.STRING(30), 
		defaultValue: ''
	}, 
	foto: {
		type: Sequelize.STRING,
		defaultValue: ''
	},
	descripcion: {
		type: Sequelize.TEXT,
		defaultValue: ''
	}
});

//Pedido (id, cliente, costo_total, estado)
const Pedido = database.define('pedido', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	}, 
	costo_total: {
		type: Sequelize.DECIMAL(20, 2),
		defaultValue: 0
	}, 
	estado: {
		type: Sequelize.ENUM('Carrito', 'Pendiente', 'Listo'), 
		defaultValue: 'Carrito'
	}
});

Cliente.hasMany(Pedido);

//Empleado(id, user, pw, nombre, apellido, rol, correo)
const Empleado = database.define('empleado', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	}, 
	user: {
		type: Sequelize.STRING(10),
		unique: true,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING(64),
		allowNull: false
	},
	correo: {
		type: Sequelize.STRING(50),
		unique: true,
		allowNull: false
	},
	rol: {
		type: Sequelize.ENUM('Admin', 'Gerente', 'Vendedor'),
		defaultValue: 'Vendedor'
	},
	nombre: {
		type: Sequelize.STRING(100)
	},
	apellido: {
		type: Sequelize.STRING(100)
	}
});

//Talla (id, nombre)
const Talla = database.define('talla', {
	ID: {
		type: Sequelize.INTEGER.UNSIGNED,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true
	}, 
	nombre: {
		type: Sequelize.STRING(10),
		defaultValue: 'NA'
	}
});

//Pertenece (modelo, categoria)
const Pertenece = database.define('pertenece', {});
Modelo.belongsToMany(Categoria, { through: Pertenece });
Categoria.belongsToMany(Modelo, { through: Pertenece });

//Inventario (modelo, colortalla, cantidad)
const Inventario = database.define('inventario', {
	colortalla: {
		type: Sequelize.STRING,
		defaultValue: '-',
		primaryKey: true,
		allowNull: false
	},
	cantidad: {
		type: Sequelize.INTEGER.UNSIGNED,
		defaultValue: 0
	}
});
Modelo.hasMany(Inventario);

//Orden (pedido, producto, cantidad, costo)
const Orden = database.define('orden', {
	cantidad: {
		type: Sequelize.INTEGER.UNSIGNED,
		defaultValue: 0
	},
	costo: {
		type: Sequelize.DECIMAL(20, 2),
		defaultValue: 0
	}
});


database.authenticate().then(()=>{
	console.log('Connected to database sucessfully');
}).catch((err)=>{
	console.log(`Oops, something went wrong with the database.\n${err}`);
});

//--------Start of sincronizing the model with the database
Color.sync({force: false}).then(()=>{
	console.log('Tabla Color sincronizada');
});

Modelo.sync({force: false}).then(()=>{
	console.log('Tabla Modelo sincronizada');
});

Categoria.sync({force: false}).then(()=>{
	console.log('Tabla Categoria sincronizada');
});

Talla.sync({force: false}).then(()=>{
	console.log('Tabla Talla sincronizada');
});

Cliente.sync({force: false}).then(()=>{
	console.log('Tabla Cliente sincronizada');
}).catch((err)=>{
	console.log('Oops, something went wrong with Cliente\n' + err);
});

Pedido.sync({force: false}).then(()=>{
	console.log('Tabla Pedido sincronizada');
}).catch((err)=>{
	console.log('Oops, something went wrong with Pedido\n' + err);
});

Empleado.sync({force: false}).then(()=>{
	console.log('Tabla Empleado sincronizada');
});

Orden.sync({force: false}).then(()=>{
	console.log('Tabla Orden sincronizada');
});

Pertenece.sync({force: false}).then(()=>{
	console.log('Tabla Pertenece sincronizada');
});

Inventario.sync({force: true}).then(()=>{
	console.log('Tabla Inventario sincronizada');
});

//----------END OF SICRONIZING MODEL WITH DATABASE

module.exports.Modelo = Modelo;
module.exports.Cliente = Cliente;
module.exports.Empleado = Empleado;
module.exports.Categoria = Categoria;
module.exports.Pertenece = Pertenece;
module.exports.Color = Color;
module.exports.Talla = Talla;
module.exports.Inventario = Inventario;
module.exports.Pedido = Pedido;
module.exports.Orden = Orden;