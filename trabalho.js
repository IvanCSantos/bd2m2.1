// Conexão e mapeamento do Bando de Dados usando ORM Sequelize
const { Sequelize, DataTypes, DATEONLY} = require('sequelize'); //npm install --save sequelize , npm install --save mysql2
const MYSQL_IP="localhost";
const MYSQL_LOGIN="root";
const MYSQL_PASSWORD="a1b2c3d4";
const DATABASE = "employees"; // Usando modelo testdb https://github.com/datacharmer/test_db
const sequelize = new Sequelize(DATABASE , MYSQL_LOGIN, MYSQL_PASSWORD, {
  host: MYSQL_IP,
  dialect: "mysql"
});

// Modelo employess
const Employee = sequelize.define('Employee', {
    emp_no: { type: DataTypes.INTEGER, autoIncrement:true, primaryKey: true },
    birth_date: { type: DataTypes.DATEONLY },
    first_name: { type: DataTypes.STRING(14) },
    last_name: { type: DataTypes.STRING(16) },
    gender: { type: DataTypes.ENUM('M', 'F' )},
    hire_date: { type: DataTypes.DATEONLY }
}, { tableName: 'employees', timestamps: false });

const Salary = sequelize.define('Salary', {
    emp_no: { type: DataTypes.INTEGER, primaryKey: true },
    salary: { type: DataTypes.INTEGER },
    from_date: { type: DataTypes.DATEONLY, primaryKey: true },
    to_date: { type: DataTypes.DATEONLY, primaryKey: true }
}, { tableName: 'salaries', timestamps: false });
Employee.hasMany(Salary, { foreignKey: 'emp_no' });

const Title = sequelize.define('Title', {
    emp_no: { type: DataTypes.INTEGER, primaryKey: true },
    title: { type: DataTypes.STRING(50), primaryKey: true },
    from_date: { type: DataTypes.DATEONLY },
    to_date: { type: DataTypes.DATEONLY }
}, { tableName: 'titles', timestamps: false });
Employee.hasMany(Title, { foreignKey: 'emp_no' });

const Department = sequelize.define('Department', {
    dept_no: { type: DataTypes.CHAR(4), primaryKey: true },
    dept_name: { type: DataTypes.STRING(40) }
}, { tableName: 'departments', timestamps: false });

const DepartmentEmployee = sequelize.define('DepartmentEmployee', {
    emp_no: { type: DataTypes.INTEGER, primaryKey: true },
    dept_no: { type: DataTypes.CHAR(4), primaryKey: true },
    from_date: { type: DataTypes.DATEONLY },
    to_date: { type: DataTypes.DATEONLY }
}, { tableName: 'dept_emp', timestamps: false });
Employee.belongsToMany(Department, { through: DepartmentEmployee, foreignKey: 'emp_no'});
Department.belongsToMany(Employee, { through: DepartmentEmployee, foreignKey: 'dept_no'});

const DepartmentManager = sequelize.define('DepartmentManager', {
    dept_no: { type: DataTypes.CHAR(4), primaryKey: true },
    emp_no: { type: DataTypes.INTEGER, primaryKey: true },
    from_date: { type: DataTypes.DATEONLY },
    to_date: { type: DataTypes.DATEONLY }
}, { tableName: 'dept_manager', timestamps: false });
Department.hasMany(DepartmentManager, { foreignKey: 'dept_no'});
Employee.hasMany(DepartmentManager, { foreignKey: 'emp_no'});

let testConnection = async function(){
    try {
        sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    try {
      let employees = await Employee.findOne({ where: { emp_no: 10001}, include: Title });

      console.log(employees.dataValues.Titles.dataValues, employees.dataValues.Titles.dataValues);
    } catch (error) {
      console.error("Error log", error);
    }
}
//testConnection();

let fetchAllEmployees = async function() {
    try {
        //let employees =  await Employee.findAll({ include: [ Title, Salary, Department, DepartmentManager ]});
        let employees =  await Employee.findOne({ where: { emp_no: 10001 }, include: [ Title, Salary, Department, DepartmentManager ]});
        console.log(employees);
    } catch (error) { 
        console.error("Error log", error);
    }
};
fetchAllEmployees();