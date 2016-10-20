var mysql = require('mysql')
var inquirer = require('inquirer')
var secretKey = require('./secret_key')
var Table = require('cli-table')

var conn = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: secretKey.password,
	database: 'bamazon'
})

// query for viewing the sales and profits for all departments
function viewSales() {
	conn.query('SELECT departmentID, departmentName, overHeadCosts, totalSales FROM departments;', function(err, res) {
		if (err) {throw err}

		// instantiate Table
		var table = new Table({
			head: ['Department ID', 'Department Name', 'Overhead Costs', 'Total Sales', 'Total Profit'], colWidths: [15, 27, 16, 13, 14]
		})

		// populates rows of table with data from the query
		for (var i in res) {
			table.push([res[i].departmentID, res[i].departmentName, res[i].overHeadCosts, res[i].totalSales, (parseFloat(res[i].totalSales)) - parseFloat(res[i].overHeadCosts)])
		}
		console.log(table.toString())
	})
}

// adds new department to department table, selectable for the manager to add products to in the manager.js file
function createDepartment() {
	var prompt2 = 
	[
		{
			type: 'input',
			message: 'What is the name of the department?',
			name: 'departmentName'
		},
		{
			type: 'input',
			message: 'What is the Overhead Cost for this department?',
			name: 'overHead',
			// checks and enforces decimal or integer values
			filter: function(num) {
				return parseFloat(num)
			},
			validate: function(num) {
				if (isNaN(parseFloat(num))) {
					return 'Please enter a numeric value'
				} else {
					return true
				}
			}
		},
		{
			type: 'input',
			message: 'What is the Total Sales for this department?',
			name: 'totalSales',
			// checks and enforces decimal or integer values
			filter: function(num) {
				return parseFloat(num)
			},
			validate: function(num) {
				if (isNaN(parseFloat(num))) {
					return 'Please enter a numeric value'
				} else {
					return true
				}
			}
		}
	]

	inquirer.prompt(prompt2).then(function(answer) {
		conn.query(`INSERT INTO departments (departmentName, overHeadCosts, totalSales) VALUES (${conn.escape(answer.departmentName)}, ${conn.escape(answer.overHead)}, ${conn.escape(answer.totalSales)});`, function(err, res) {
			if (err) {throw err}

			console.log(`New Department added: ${conn.escape(answer.departmentName)}, $${conn.escape(answer.overHead)}, $${conn.escape(answer.totalSales)}`)
		})
	})
}

var prompt1 = 
[
	{
		type: 'list',
		name: 'command',
		message: 'What would you like to do?',
		choices: ['View Product Sales by Department', 'Create New Department']
	},
]

var departmentList = []

conn.query('SELECT departmentName FROM departments', function(err, res) {
	if (err) {throw err}

	// updates list of currently available departments before user is prompted
	for (var i in res) {
		departmentList.push(res[i].departmentName)
	}

	inquirer.prompt(prompt1).then(function(answer) {
		switch(answer.command) {
			case 'View Product Sales by Department':
				viewSales()
				break
			case 'Create New Department':
				createDepartment()
				break
		}
	})
})