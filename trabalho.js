// PROMPT
const prompt = require('prompt-sync')({sigint: true}) // npm install --save prompt-sync

// Habilita / Desabilita debug no código
let debug = false;

// MYSQL Sequelize
const { Sequelize, DataTypes} = require('sequelize'); //npm install --save sequelize , npm install --save mysql2
const MYSQL_IP="localhost";
const MYSQL_LOGIN="root";
const MYSQL_PASSWORD="a1b2c3d4";
const DATABASE = "employees"; // Usando modelo testdb https://github.com/datacharmer/test_db
const sequelize = new Sequelize(DATABASE , MYSQL_LOGIN, MYSQL_PASSWORD, {
  host: MYSQL_IP,
  dialect: "mysql",
  logging: debug
});

let mySQLConnTest = async function() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the MySQL database:', error);
    }
};
if(debug) mySQLConnTest();

// MONGODB
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/'; //$ mongo mongodb://<host>:<port>
const client = new MongoClient(uri);

let mongoConnTest = async function() {
    try {
        client.connect().then(function() {
            client.db().admin().listDatabases().then(function(databases){
                console.log("Databases: ", databases);
            });
        });
    } catch (error) {
        console.error('Unable to connect to the MongoDB database', error);
    }
}
if (debug) mongoConnTest();

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

// const DepartmentManager = sequelize.define('DepartmentManager', {
//     dept_no: { type: DataTypes.CHAR(4), primaryKey: true },
//     emp_no: { type: DataTypes.INTEGER, primaryKey: true },
//     from_date: { type: DataTypes.DATEONLY },
//     to_date: { type: DataTypes.DATEONLY }
// }, { tableName: 'dept_manager', timestamps: false });
// Department.belongsToMany(Employee, { through: DepartmentManager, foreignKey: 'dept_no'});
// Employee.belongsToMany(Department, { through: DepartmentManager, foreignKey: 'emp_no'});

let deleteEmployeeCollection = async function(){
    collection.drop(function(err, delOK) {
        if(err) throw err;
        if(delOK) console.log("Collection deleted");
        collection.close();
    });
}

let insertMongoData = async function (employees) {
    //await client.connect();
    let db = client.db("univalibd2");
    let collection = db.collection('employees');

    try {
        //collection.insertMany(employees);
        employees.forEach(employee => {
            collection.updateOne(
                {"emp_no": employee.emp_no}, // Filter
                {$set: employee}, // Update
                { upsert: true}); // Insert if not exists
        })
        if (debug) console.log("Inserido registros em employeeList no MongoDB");
    } catch (error) {
        console.error("Error log", error);
    };
    //client.close();
};

let createMongoIndexes = async function () {
    let db = client.db("univalibd2");
    let collection = db.collection('employees');
    collection.createIndex({ "titles.title": "text", "departments.department": "text" }, { default_language: 'en' });
}

let getEmployeeByTitles = async function(title) {
    let db = client.db("univalibd2");
    let collection = db.collection('employees');

    let query = { "titles.title": title };
    let options = { sort: { emp_no: 1}};

    let employees = [];

    try {
        employees = collection.find(query, options);
    } catch (error) {
        console.error("Erro", error);
    }
    console.log("\n\n*** Imprimindo resultados da consulta: ***");
    console.log(`Funcionários com title = ${title}\n\n`);
    let count = 0;
    for await (const employee of employees){
        console.log(employee);
        count++;
    };
    console.log("Total de registros:", count, "\n\n");
};

let getEmployeeByDepartment = async function(department) {
    let db = client.db("univalibd2");
    let collection = db.collection('employees');

    let query = { "departments.dept_name": department };
    let options = { sort: { emp_no: 1}};

    let employees = [];

    try {
        employees = collection.find(query, options);
    } catch (error) {
        console.error("Erro", error);
    }
    console.log("\n\n*** Imprimindo resultados da consulta: ***");
    console.log(`Funcionários do departamento = ${department}\n\n`);
    let count = 0;
    for await (const employee of employees){
        console.log(employee);
        count++;
    };
    console.log("Total de registros:", count, "\n\n");
};

let getEmployeeByManager = async function(manager) {
    let db = client.db("univalibd2");
    let collection = db.collection('employees');

    let query = { "first_name": manager };
    let options = { sort: { emp_no: 1}};

    let employees = [];

    try {
        employees = collection.find(query, options);
    } catch (error) {
        console.error("Erro", error);
    }
    console.log("\n\n*** Imprimindo resultados da consulta: ***");
    console.log(`Funcionários por Gerente = ${manager}\n\n`);
    let count = 0;
    for await (const employee of employees){
        console.log(employee);
        count++;
    };
    console.log("Total de registros:", count, "\n\n");
};


let getDepartmentsAverageWage = async function(department) {
    let db = client.db("univalibd2");
    let collection = db.collection('employees');

    let employees = [];
    let departments = {};

    try {
        employees = collection.find();
    } catch (error) {
        console.error("Erro", error);
    }

    for await (const employee of employees){
        let salary = employee.salaries[employee.salaries.length -1].salary;
        let department = employee.departments[employee.departments.length - 1].dept_name;
        
        if (departments[department] != undefined) {
            departments[department].push(salary);
        } else {
            departments[department] = []
        }
    };

    console.log("\n\n*** Médias salariais por departamento. ***")
    for(const [key, value] of Object.entries(departments)) {
        let sum = 0;
        for(let i = 0; i < value.length; i++) {
            sum+=value[i]
        }
        let media = sum / value.length;
        media = media.toFixed(2);
        console.log(`${key}: ${media}`);
    }
    console.log("\n\n");
};

let migrateMySQLToMongo = async function() {
    //await sequelize.authenticate();
    let employeeList = []
    try {
        let amount = await Employee.count();
        if (debug) console.log("Quantidade de registros encontrados na tabela employee: ", amount);
        let pages = Math.ceil(amount/1000);
        if (debug) console.log("Quantidade de páginas da paginação da consulta SQL: ", pages);

        for(let i = 0; i < pages; i++){
            let employees =  await Employee.findAll({
                //include: [Title, Salary, Department, DepartmentManager], 
                include: [Title, Salary, Department],
                order: [['emp_no', 'ASC']],
                offset: i*1000,
                limit: 1000
            });
            employees.forEach(employee => {
                let newEmployeeObject = employee.dataValues;
                newEmployeeObject
                newEmployeeObject.titles = [];
                newEmployeeObject.salaries = [];
                newEmployeeObject.departments = [];
                // newEmployeeObject.departmentManagers = [];

                newEmployeeObject.Titles.forEach(title => {
                    delete title.dataValues.emp_no;
                    newEmployeeObject.titles.push(title.dataValues);
                });

                newEmployeeObject.Salaries.forEach(salary => {
                    delete salary.dataValues.emp_no;
                    newEmployeeObject.salaries.push(salary.dataValues);
                });

                newEmployeeObject.Departments.forEach(department => {
                    delete department.dataValues.DepartmentEmployee;
                    newEmployeeObject.departments.push(department.dataValues);
                });

                // newEmployeeObject.DepartmentManagers.forEach(departmentManager => {
                //     newEmployeeObject.departmentManagers.push(departmentManager.dataValues);
                // });

                delete newEmployeeObject.Titles;
                delete newEmployeeObject.Salaries;
                delete newEmployeeObject.Departments;
                employeeList.push(newEmployeeObject);
            });
            insertMongoData(employeeList);
            employeeList = [];
            console.log(`Executando página ${i}/${pages}`);
        }
        //sequelize.close();
    } catch (error) { 
        console.error("Error log", error);
    };
};

const displayMenuOptions = function() {
    console.log("*** SELECIONE A OPÇÃO DESEJADA ***");
    console.log("1. Sincroniza dados do MySQL para o MongoDB");
    console.log("2. Consulta funcionário a partir de id do manager");
    console.log("3. Consulta funcionário a partir de um title");
    console.log("4. Consulta funcionário a partir de um departamento");
    console.log("5. Relatório de média salarial de funcionários por departamento");
    console.log("6. Sair");
    console.log("");
}
async function menu() {
    let option = 0
    while(option !== 6){
        displayMenuOptions()
        option = parseInt(prompt("Selectione uma opção do menu: "));
        if(option < 1 || option > 6) {
            console.log("Escolha uma opção entre 1 e 6");
            break;
        }
        switch(option) {
            case 1:
                //await deleteEmployeeCollection();
                await migrateMySQLToMongo();
                await createMongoIndexes();
                break;
            case 2:
                let promptManager = prompt("Qual gerente deseja consultar? ");
                await getEmployeeByManager(promptManager);
                break
            case 3:
                let promptTitle = prompt("Qual title deseja consultar? ");
                await getEmployeeByTitles(promptTitle);
                break
            case 4:
                let promptDepartment = prompt("Qual departamento deseja consultar? ");
                await getEmployeeByDepartment(promptDepartment);
                break
            case 5:
                await getDepartmentsAverageWage();
                break
            case 6:
                console.log(typeof(option),": ", option);
            default:
                console.log(`Opção inválida ${option}!`);
        }
    }
}
menu();