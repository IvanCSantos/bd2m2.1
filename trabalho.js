// Conexão e mapeamento do Bando de Dados usando ORM Sequelize
const { Sequelize, DataTypes} = require('sequelize'); //npm install --save sequelize , npm install --save mysql2
const MYSQL_IP="localhost";
const MYSQL_LOGIN="root";
const MYSQL_PASSWORD="a1b2c3d4";
const DATABASE = "employees";
const sequelize = new Sequelize(DATABASE , MYSQL_LOGIN, MYSQL_PASSWORD, {
  host: MYSQL_IP,
  dialect: "mysql"
});

// Modelo employess
const Employee = sequelize.define('Employee', {
    emp_no: { type: DataTypes.INTEGER, primaryKey: true },
    birth_date: { type: DataTypes.DATEONLY },
    first_name: { type: DataTypes.STRING(14) },
    last_name: { type: DataTypes.STRING(16) },
    gender: { type: DataTypes.ENUM('M', 'F' )},
    hire_date: { type: DataTypes.DATEONLY }
}, {tableName: 'employees', timestamps: false});

let testConnection = async function(){
    try {
        sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    try {
      let employees = await Employee.findAll(); 
      console.log(employees);
    } catch (error) {
      console.error("Error log", error);
    }
  }
  testConnection();