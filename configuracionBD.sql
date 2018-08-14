create database tiendaTest;

create user 'Cliente'@'localhost' idenfied by 'randomPass';
GRANT ALL PRIVILEGES ON tiendaTest.* TO 'Cliente'@'localhost';
-- Remover privilegio ver tabla empleado
REVOKE SELECT ON tiendaTest.empleados FROM 'Cliente'@'localhost';
-- Remover privilegio editar tabla empleado
REVOKE DELETE ON tiendaTest.empleados FROM 'Cliente'@'localhost';
REVOKE INSERT ON tiendaTest.empleados FROM 'Cliente'@'localhost';
REVOKE UPDATE ON tiendaTest.empleados FROM 'Cliente'@'localhost';
-- Remover privilegio editar tabla Modelos
REVOKE DELETE ON tiendaTest.modelos FROM 'Cliente'@'localhost';
REVOKE INSERT ON tiendaTest.modelos FROM 'Cliente'@'localhost';
REVOKE UPDATE ON tiendaTest.modelos FROM 'Cliente'@'localhost';


create user 'Empleado'@'localhost' idenfied by 'randomPass';
GRANT ALL PRIVILEGES ON tiendaTest.* TO 'Empleado'@'localhost';
-- Remover privilegio editar tabla cliente
REVOKE DELETE ON tiendaTest.clientes FROM 'Empleado'@'localhost';
REVOKE INSERT ON tiendaTest.clientes FROM 'Empleado'@'localhost';
REVOKE UPDATE ON tiendaTest.clientes FROM 'Empleado'@'localhost';

-- Insertar usuario admin por defecto. Se ingresa con correo@admin.com y la clave es admin123
INSERT INTO empleados VALUES (0, '1f9d81a2e36d4481955172106bf19d29cd397bfcfeac690874c353daa49550c6', 'correo@admin.com', 'Admin', 'Administrador', 'Original', 'Iv4razPvr0OEjp9bLqVRp8bYxDUkRNGb9vCd8InDnMutMCFlqw8kTs1qo9OW1WkG', '2018-08-13 00:00:00', '2018-08-13 00:00:00');
