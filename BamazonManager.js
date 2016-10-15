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
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory' , 'Add New Product'],
		filter: function(choice) {
			switch(choice) {
				case 'View Products for Sale':
					return 'viewProd'
					break
				case 'View Low Inventory':
					return 'viewInven'
					break
				case 'Add to Inventory':
					return 'addInven'
					break
				case 'Add New Product':
					return 'addNewProd'
					break
			}
		}
	}
]

inquirer.prompt(prompts).then(function(answer) {
	console.log(answer)
	switch(answer.command) {
		case 'viewProd':
			viewProducts()
			break
		case 'viewInven':
			viewLowInventory()
			break
		case 'addInven':
			addInventory()
			break
		case 'addNewProd':
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

}

function addInventory() {

}

function addNewProduct() {

}