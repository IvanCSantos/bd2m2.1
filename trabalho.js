// Conexão e mapeamento do Banco de Dados MySQL usando ORM Sequelize
const { Sequelize, DataTypes, DATEONLY} = require('sequelize'); //npm install --save sequelize , npm install --save mysql2
const MYSQL_IP="localhost";
const MYSQL_LOGIN="root";
const MYSQL_PASSWORD="a1b2c3d4";
const DATABASE = "employees"; // Usando modelo testdb https://github.com/datacharmer/test_db
const sequelize = new Sequelize(DATABASE , MYSQL_LOGIN, MYSQL_PASSWORD, {
  host: MYSQL_IP,
  dialect: "mysql"
});

// Conexão do Banco de Dados MongoDB
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/'; //$ mongo mongodb://<host>:<port>
const client = new MongoClient(uri);


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

function printEmployeesList(employee) {
 
}

let getAllEmployeesFromMySQL = async function() {
    try {
        // Eager Loading resultou em erro devido a grande quantidade de dados
        // FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
        //let employees =  await Employee.findAll({ include: [ Title, Salary, Department, DepartmentManager ]});
        //let employees =  await Employee.findOne({ where: { emp_no: 10001 }, include: [ Title, Salary, Department, DepartmentManager ]});
        //let employess = await Employee.findAll({ include: [ { model: Title,}, { model: Salary,},],});


        // Lazy Loading
        //let employees =  await Employee.findAll({ include: [ Title, Salary, Department, DepartmentManager ]});
        let employees =  await Employee.findAll();
        //let employees =  await Employee.findByPk(10001);
        //let titles = await employees.getTitles();
        //let title = await employees.getTitles();
        //console.log(JSON.stringify(title));
        
        // Dessa forma deu timeout

        
        employees.forEach(async function (employee) {
            let newEmployee = employee.dataValues;
            let titles = await employee.getTitles();
            let salaries = await employee.getSalaries();
            

            let newTitles = []
            titles.forEach((title) => {
                newTitles.push({
                    title: title.dataValues.title,
                    from_date: title.dataValues.from_date,
                    to_date: title.dataValues.to_date
                });
            });
            newEmployee.titles = newTitles;

            let newSalaries = []
            salaries.forEach((salary) => {
                newSalaries.push({
                    salary: salary.dataValues.salary,
                    from_date: salary.dataValues.from_date,
                    to_date: salary.dataValues.to_date,
                });
            });
            newEmployee.salaries = newSalaries;

            console.log(newEmployee);
        });

        //employees.forEach(mysqlToJSON)
        //console.log(employees);
    } catch (error) { 
        console.error("Error log", error);
    }
};
getAllEmployeesFromMySQL();