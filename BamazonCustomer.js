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

var listofProducts = []
var selectedProduct = undefined

conn.query('SELECT itemID, productName, price, stockQuantity FROM products', function(err, res) {
	// console.log(res)
	if (err) throw err;
	
	displayItems(res)

	inquirer.prompt(prompts).then(function(answers) {
		// console.log(answers)
		placeOrder(answers)
	})
})

var prompts = 
[
	{
		type: 'input',
		message: 'Please enter the id of the product you would like to purchase',
		name: 'id',
		filter: function(id) {
			return parseInt(id)
		},
		validate: function(id) {
			for (var i in listofProducts) {
				if (listofProducts[i].itemID == parseInt(id)) {
					selectedProduct = id
					return true
				}
			}
			return 'That product id is not available'
		}
	},
	{
		type: 'input',
		message: 'How many units of this product would you like to purchase?',
		name: 'quantity',
		filter: function(unit) {
			return parseInt(unit)
			},
		validate: function(unit) {
			for (var i in listofProducts) {
				if (listofProducts[i].itemID == selectedProduct && listofProducts[i].stockQuantity >= parseInt(unit)) {
					return true
				}
			}
			return 'That amount is not currently availabe'
		}
	}
]


function displayItems(res) {
	console.log('================')
	console.log('id                name                   price')
	for (var i in res) {
		console.log(res[i].itemID + '                 ' + res[i].productName + '              $' + res[i].price)
		var obj = {
			itemID : res[i].itemID,
			productName: res[i].productName,
			price: res[i].price,
			stockQuantity: res[i].stockQuantity
		}
		listofProducts.push(obj)
	}
	console.log(listofProducts)
}



function placeOrder(input) {
	conn.query('UPDATE products SET stockQuantity = stockQuantity - ' + conn.escape(input.quantity) + ' WHERE itemID = ' + conn.escape(input.id), function(err,res) {
		if (err) throw err;

		// console.log('Update has completed:', input.id, input.quantity)
		for (var i in listofProducts) {
			if (listofProducts[i].itemID == input.id)
				var price = listofProducts[i].price
		}

		var total = price * input.quantity
		console.log('The total price for your order is $' + total)
	})
}