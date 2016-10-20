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

// globals used to populate tables and confirm order with up to date info
var listofProducts = []
var selectedProduct = undefined

var prompts = 
[
	{
		type: 'input',
		message: 'Please enter the id of the product you would like to purchase',
		name: 'id',
		// makes sure input is an integer in the available range, stores the selection to the global variable selectedProduct to use later
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
			// if something other than an int in the product range is entered, the user is prompted again
			return 'That product id is not available'
		}
	},
	{
		type: 'input',
		message: 'How many units of this product would you like to purchase?',
		name: 'quantity',
		// checks if the input amount is greater than the stock value for the product and that it's an int value
		filter: function(unit) {
			return parseInt(unit)
			},
		validate: function(unit) {
			for (var i in listofProducts) {
				if (listofProducts[i].itemID == selectedProduct && listofProducts[i].stockQuantity >= parseInt(unit))  {
					return true
				}
			}
			// prompts the user again if the stock value is less than they're requesting
			return 'That amount is not currently availabe'
		}
	}
]

function displayItems(res) {
	// instantiate Table object
	var table = new Table({
		head: ['Product ID', 'Product Name', 'Price'], colWidths: [15, 15, 15]
	})

	for (var i in res) {
		// appends rows to table that gets displayed to the user before ordering
		table.push([res[i].itemID, res[i].productName, '$' + res[i].price])
		// list of objects populated as listofProducts to be used by the placeOrder query
		var obj = {
			itemID : res[i].itemID,
			productName: res[i].productName,
			price: res[i].price,
			stockQuantity: res[i].stockQuantity
		}
		listofProducts.push(obj)
	}
	console.log(table.toString())
}



function placeOrder(input) {
	conn.query('UPDATE products SET stockQuantity = stockQuantity - ' + conn.escape(input.quantity) + ' WHERE itemID = ' + conn.escape(input.id), function(err,res) {
		if (err) throw err;

		// looks for the price of the selected item
		for (var i in listofProducts) {
			if (listofProducts[i].itemID == input.id) {
				var price = listofProducts[i].price
			}
		}

		var total = price * input.quantity
		console.log('The total price for your order is $' + total)
		updateSales(total, input.id)
	})
}

// function used for the executive.js file, adds the sale to the department sales
function updateSales(total, item) {
	// finds the name of the department the ordered item belongs to
	conn.query('SELECT departmentName FROM products WHERE itemID = ' + conn.escape(item), function(err,res) {
		if (err) {throw err}

		var depName = res[0].departmentName

		// based on the department, update that row in table departments with the sale total
		conn.query('UPDATE departments SET totalSales = totalSales + ' + conn.escape(total) + ' WHERE departmentName = ' + conn.escape(depName), function(err, res) {
			if (err) {throw err}

			console.log('Total Sales column updated:', depName, '+$' + total)
		})
	})
}


// query used to pull the latest data on products before prompting the customer; populates the products array
conn.query('SELECT itemID, productName, price, stockQuantity FROM products', function(err, res) {
	if (err) throw err;
	
	displayItems(res)

	// runs the placeOrder function after all prompts have been filled out and validated; passes all selections in
	inquirer.prompt(prompts).then(function(answers) {
		placeOrder(answers)
	})
})