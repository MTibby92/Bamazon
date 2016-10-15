var mysql = require('mysql')
var inquirer = require('inquirer')
var secret_key = require('./secret_key')

var conn = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: secret_key.password,
	database: 'bamazon'
})

var prompts = 
[
	{
		type: 'list',
		message: 'What would you like to do?',
		name: 'command',
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory' , 'Add New Product']
	}
]

inquirer.prompt(prompts).then(function(answer) {
	// console.log(answer)
	switch(answer.command) {
		case 'View Products for Sale':
			viewProducts()
			break
		case 'View Low Inventory':
			viewLowInventory()
			break
		case 'Add to Inventory':
			addInventory()
			break
		case 'Add New Product':
			addNewProduct()
			break
	}
})

function viewProducts() {
	conn.query('SELECT itemID, productName, price, stockQuantity FROM products', function(err, res) {
		if (err) throw err;
		// console.log(res)
		console.log('================')
		console.log('id                name                   price                   quantity in stock')
		for (var i in res) {
			console.log(res[i].itemID + '                 ' + res[i].productName + '              $' + res[i].price + '               ' + res[i].stockQuantity)
		}
	})
}

function viewLowInventory() {
	conn.query('SELECT itemID, productName, price, stockQuantity from products WHERE stockQuantity < 5', function(err, res) {
		if (err) throw err;

		// console.log(res)
		if (res.length == 0) {
			console.log('There are no products with less than 5 items left in stock currently.')
		}
		else {
			console.log('================')
			console.log('id                name                   price                   quantity in stock')
			for (var i in res) {
				console.log(res[i].itemID + '                 ' + res[i].productName + '              $' + res[i].price + '               ' + res[i].stockQuantity)
			}
		}
	})
}

function addInventory() {

}

function addNewProduct() {

}