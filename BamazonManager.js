var mysql = require('mysql')
var inquirer = require('inquirer')
var secretKey = require('./secret_key')

var conn = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: secretKey.password,
	database: 'bamazon'
})

var listofProducts = []
conn.query('SELECT itemID, productName, price, stockQuantity FROM products', function(err, res) {
	if (err) {throw err}

	for (var i in res) {
		var obj = {
			itemID : res[i].itemID,
			productName: res[i].productName,
			price: res[i].price,
			stockQuantity: res[i].stockQuantity
		}
		listofProducts.push(obj)
	}
	console.log(listofProducts)

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

function viewProducts() {
	conn.query('SELECT itemID, productName, price, stockQuantity FROM products', function(err, res) {
		if (err) {throw err}
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
		if (err) {throw err}

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
	var productChoices = []
	for (var i in listofProducts) {
		productChoices.push(listofProducts[i].itemID + ' ' + listofProducts[i].productName)
	}

	var prompt2 = 
	[
		{
			type: 'list',
			message: 'Which product would you like to add inventory to?',
			name: 'product',
			choices: productChoices
		},
		{
			type: 'input',
			message: 'How many items would you like to add to the inventory?',
			name: 'number',
			filter: function(num) {
				return parseInt(num)
			},
			validate: function(num) {
				if (isNaN(parseInt(num))) {
					return 'Please enter a numeric value'
				} else {
					return true
				}
			}
		}
	]

	inquirer.prompt(prompt2).then(function(answer) {
		console.log(answer)
		// console.log(answer.product.split(' '))
		var id = answer.product.split(' ')
		// console.log(id[0])
		conn.query(`UPDATE products SET stockQuantity = stockQuantity + ${answer.number} WHERE itemID = ${parseInt(id[0])};`, function(err,res) {
			if (err) {throw err}

			console.log(`Inventory updated! ${answer.product} +${answer.number}`)			
		})
	})
}

function addNewProduct() {
	var prompt3 = 
	[
		{
			type: 'input',
			message: 'Enter the name of the product you\'d like to add',
			name: 'productName'
		},
		{
			type: 'list',
			message: 'Enter the name of the department the product belongs in',
			name: 'departmentName',
			choices: ['Books & Audible', 'Movies, Music, & Games', 'Electronics & Computers', 'Home, Garden, & Tools', 'Beauty, Health, & Grocery', 'Toys, Kids, & Baby', 'Clothing, Shoes, & Jewelry', 'Handmade', 'Sports & Outdoors', 'Automotive & Industrial']
		},
		{
			type: 'input',
			message: 'Enter the price of the product',
			name: 'productPrice',
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
			message: 'How many items would you like to add to the inventory?',
			name: 'stockQuantity',
			filter: function(num) {
				return parseInt(num)
			},
			validate: function(num) {
				if (isNaN(parseInt(num))) {
					return 'Please enter a numeric value'
				} else {
					return true
				}
			}
		}
	]

	inquirer.prompt(prompt3).then(function(answer) {
		// console.log(answer)
		
		conn.query(`INSERT INTO products (productName, departmentName, price, stockQuantity) VALUES (${conn.escape(answer.productName)}, ${conn.escape(answer.departmentName)}, ${conn.escape(answer.productPrice)}, ${conn.escape(answer.stockQuantity)});`, function(err,res) {
			if (err) {throw err}

			console.log(`New Product added ${answer.productName}, ${answer.departmentName}, ${answer.productPrice}, ${answer.stockQuantity}`)
		})
	})
}