/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const stripe = require('stripe')('sk_test_51Pw9ZmFjHJkvjNPzXYLn0OBXQuSWPXjaAzPPRl8JgM7GRJmSF91DQ1dZHlIFdxqZSPjYX4Z78iBUYN6bteoXEqbP00addicsNY')
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

var allProducts = []

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/**********************
 * Example get method *
 **********************/

app.get('/api/get_products', async(req, res) => {
	console.log("getting products");
	const start = Number(req.query.start);
	const amount = Number(req.query.amount);
	const slice = allProducts.slice(start, start+amount);
	const products = [];

	slice.forEach(element => {
		var product = {
			name: element.name,
			detail: element.description || "",
			price: (element.default_price).unit_amount || -1,
			id: element.id,
			image: element.images[0] || "/placeholder.svg",
			price_id: (element.default_price).id,
		}

		products.push(product);
	});

	res.status(200).json(products);
})

app.get('/api/session_status', async (req, res) => {
	const session_id = req.query.session_id.toString();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.send(
        {status: session.status, payment_status: session.payment_status}
    );
});

app.get('/api/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

function updateProduct(id, product) {
	for (var i = 0; i < allProducts.length; i++) {
		if (allProducts[i].id == id) {
			const tempPrice = allProducts[i].default_price;
			allProducts[i] = product;
			allProducts[i].default_price = tempPrice;
			return;
		}
	}
}

/****************************
* Example post method *
****************************/

app.post('/api/recaptcha', async (req, res) => {
	const reCAPTCHA_SECRET_KEY = "6Lfy2i0qAAAAAH8BzgRgf8GZwuK2WnEONd5qyJdw";
	const response = req.body.response;

	const body = `secret=${reCAPTCHA_SECRET_KEY}&response=${response}`;

	console.log(body);

	const isVerified = await fetch("https://www.google.com/recaptcha/api/siteverify", {
		method: "POST",
		body: body,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
		  },
	})
	.then((response) => response.json())
	.then((json) => {
		console.log(json)
		if (json.success == true) {
			console.log("true")
			res.status(200).json({success: true});
		} else {
			console.log("false")
			res.status(400).json({success: false});
		}
	});
});

app.post('/api/create_product', async(req, res) => {
	const name = req.body.name;
	const description = req.body.description;
	const price = Number(req.body.price);
	var price_id = req.body.price_id;
	const image_url = req.body.image_url;
	const id = req.body.id;

	await auth.verifyIdToken(req.body.token)
	.then(async (decodedToken) => {
		console.log(decodedToken);
		if (decodedToken["admin"]) {
			console.log("is admin verified");
			if (id) {
				var oldPriceID = "";
				for (var i = 0; i < allProducts.length; i++) {
					if (allProducts[i].id == id) {
						// found matching product
						if ((allProducts[i].default_price).unit_amount != price) {
							// create new price and add it to product
							await stripe.prices.create({
								currency: "usd",
								unit_amount: price,
								product: id
							})
							.then((price) => {
								//change price_id to new price.id
								oldPriceID = price_id;
								price_id = price.id;
								allProducts[i].default_price = price;
							})
							.catch(() => {
								res.status(400).send("failed to update price");
								return;
							});
		
							break;
						}
					}
				}
		
		
				await stripe.products.update(id, {
					name: name,
					description: description,
					images: [image_url],
					default_price: price_id
				})
				.then(async (product) => {
					updateProduct(id, product);
					await stripe.prices.update(oldPriceID, {
						active: false
					}).then(() => {
						res.status(200).send("product updated");
						return;
					}).catch(() => {
						res.status(400).send("price failed to update");
						return;
					})

				})
				.catch(() => {
					res.status(400).send("product failed to update");
					return;
				})
			} else {
				const product = await stripe.products.create({
					name: name,
					description: description,
					images: [image_url],
					default_price_data: {
						currency: "usd",
						unit_amount: price	
					}
				})
				.then((product) => {
					allProducts.push(product);
					res.status(200).send("product created");
					return;
				})
				.catch(() => {
					res.status(400).send("product failed to create");
					return;
				})
				
			}
			return;
		}
		res.status(400).send("not authorized");
		return;
	})
	.catch((error) => {
		console.log("error with jwt token");
		res.status(400).send("error with jwt token");
		return;
	});
});

app.post('/api/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: req.body.priceID,
      quantity: 1
    }
  ],
  mode: 'payment',
  ui_mode: 'embedded',
  return_url: 'http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}'
});

  res.send({clientSecret: session.client_secret});
});

app.post('/api/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

allProducts = (await stripe.products.list({limit: 100, expand: ["data.default_price"]})).data;

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
