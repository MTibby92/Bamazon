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

function viewSales() {
	conn.query('SELECT departmentID, departmentName, overHeadCosts, totalSales FROM departments;', function(err, res) {
		if (err) {throw err}

		// instantiate 
		var table = new Table({
			head: ['Department ID', 'Department Name', 'Overhead Costs', 'Total Sales', 'Total Profit'], colWidths: [15, 27, 16, 13, 14]
		})

		for (var i in res) {
			table.push([res[i].departmentID, res[i].departmentName, res[i].overHeadCosts, res[i].totalSales, (parseFloat(res[i].totalSales)) - parseFloat(res[i].overHeadCosts)])
		}
		console.log(table.toString())
	})
}

function createDepartment() {

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