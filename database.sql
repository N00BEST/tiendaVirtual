CREATE DATABASE tienda_virtual;

CREATE TABLE cliente (id_cliente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, user_cliente VARCHAR(10) UNIQUE NOT NULL, pw_cliente VARCHAR(64) NOT NULL, nombre VARCHAR(100), apellido VARCHAR(100), edad INT(2), sexo ENUM('M', 'F') DEFAULT 'M', direccion VARCHAR(200) DEFAULT '', telefono VARCHAR(15) DEFAULT '', correo VARCHAR(100) NOT NULL);

CREATE TABLE modelo (id_modelo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, codigo VARCHAR(20) UNIQUE NOT NULL, nombre VARCHAR(100), descripcion VARCHAR(500) DEFAULT '', foto VARCHAR(150), precio DECIMAL(10, 2) NOT NULL, descuento DECIMAL(5, 2), cantidad INT UNSIGNED DEFAULT 0);

CREATE TABLE categoria (id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, nombre VARCHAR(20) DEFAULT '', descripcion VARCHAR(500) DEFAULT '');

CREATE TABLE pedido (id_pedido INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, cliente INT UNSIGNED NOT NULL, costo_total DECIMAL(20, 2) NOT NULL, estado ENUM('Carrito', 'Pagado', 'Listo'), FOREIGN KEY (cliente) REFERENCES cliente(id_cliente));

CREATE TABLE empleado (id_empleado INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, user_empleado VARCHAR(10) UNIQUE NOT NULL, pw_empleado VARCHAR(64) NOT NULL, nombre VARCHAR(100), apellido VARCHAR(100), sexo ENUM('M', 'F') DEFAULT 'M', rol ENUM('Admin', 'Vendedor', 'Gerente'), correo VARCHAR(100) NOT NULL, telefono VARCHAR(15) DEFAULT '');

CREATE TABLE color (id_color INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, nombre VARCHAR(20));

CREATE TABLE talla (id_talla INT UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL, nombre VARCHAR(10) DEFAULT 'NA');

CREATE TABLE orden (pedido INT UNSIGNED, producto INT UNSIGNED, cantidad INT UNSIGNED DEFAULT 0, costo DECIMAL(20, 2) NOT NULL, PRIMARY KEY (pedido, producto), FOREIGN KEY (pedido) REFERENCES pedido(id_pedido), FOREIGN KEY (producto) REFERENCES producto(id_producto));

CREATE TABLE pertenece (producto INT UNSIGNED, categoria INT UNSIGNED, PRIMARY KEY (producto, categoria), FOREIGN KEY (producto) REFERENCES producto(id_producto), FOREIGN KEY (categoria) REFERENCES categoria(id_categoria));

CREATE TABLE inventario (modelo INT UNSIGNED, color INT UNSIGNED, talla INT UNSIGNED, cantidad INT UNSIGNED DEFAULT 0, PRIMARY KEY (modelo, color, talla), FOREIGN KEY (modelo) REFERENCES modelo(id_modelo), FOREIGN KEY color REFERENCES color(id_color), FOREIGN KEY talla REFERENCES talla(id_talla));