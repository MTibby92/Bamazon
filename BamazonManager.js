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

// before any user input, database is queried and up-to-date data is stored in the global array of objects listofProducts
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

	// inital prompts for user regarding what function they'd like to run
	inquirer.prompt(prompts).then(function(answer) {
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

// displays table of currently available products, including the number in stock
function viewProducts() {
	conn.query('SELECT itemID, productName, price, stockQuantity FROM products', function(err, res) {
		if (err) {throw err}

		// instantiate Table
		var table = new Table({
			head: ['Product ID', 'Product Name', 'Price', 'Quantity in Stock'], colWidths: [12, 15, 13, 20]
		})

		for (var i in res) {
			table.push([res[i].itemID, res[i].productName, '$' + res[i].price, res[i].stockQuantity])
		}
		console.log(table.toString())
	})
}

// selects and displays items that have less than 5 items in stock; other wise returns a statement saying there's nothing like that
function viewLowInventory() {
	conn.query('SELECT itemID, productName, price, stockQuantity from products WHERE stockQuantity < 5', function(err, res) {
		if (err) {throw err}

		// checks condition where there's no products less than 5 in stock
		if (res.length == 0) {
			console.log('There are no products with less than 5 items left in stock currently.')
		} else {
			// instantiate Table
			var table = new Table({
				head: ['Product ID', 'Product Name', 'Price', 'Quantity in Stock'], colWidths: [12, 15, 13, 20]
			})

			for (var i in res) {
				table.push([res[i].itemID, res[i].productName, '$' + res[i].price, res[i].stockQuantity])
			}
			console.log(table.toString())
		}
	})
}

// increases the stock of a selected product
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
			// checks if the input value is an int, reprompts otherwise
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
		// splits the id from the product name; initially combined for display purposes
		var id = answer.product.split(' ')

		conn.query(`UPDATE products SET stockQuantity = stockQuantity + ${answer.number} WHERE itemID = ${parseInt(id[0])};`, function(err,res) {
			if (err) {throw err}

			console.log(`Inventory updated! ${answer.product} +${answer.number}`)			
		})
	})
}

// function for adding new product to table, requires all fields except id
function addNewProduct() {
	// pulls in the current list of available departments to add a product to
	var departmentList = []
	conn.query('SELECT departmentName FROM departments', function(err, res) {
		if (err) {throw err}

		for (var i in res) {
			departmentList.push(res[i].departmentName)
		}
	
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
				// choices are updated based on what's in the database
				choices: departmentList
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
	})
}