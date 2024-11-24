import express from "express";
import cors from "cors";
import Stripe from 'stripe';
import admin from 'firebase-admin';
import serviceAccount from "./firebase-admin.json";

const firebase = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
const firestore = firebase.firestore();

const auth = admin.auth()

auth.setCustomUserClaims("jdZHlLY1lgWQ14KyEG8EyhDBio42", {admin: true});

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe('PRIVATE_KEY');

var allProducts: Stripe.Product[] = []

type ProductWithID = {
    name: string;
    detail: string;
    price: number;
    id: string;
	price_id: string;
    image: string;
};

app.post('/create-checkout-session', async (req, res) => {
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

app.get('/session_status', async (req, res) => {
	const session_id = req.query.session_id!.toString();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.send(
        {status: session.status, payment_status: session.payment_status}
    );
});

app.get('/get_products', async(req, res) => {
	console.log("getting products");
	const start = Number(req.query.start);
	const amount = Number(req.query.amount);
	const slice = allProducts.slice(start, start+amount);
	const products: ProductWithID[] = [];

	slice.forEach(element => {
		var product: ProductWithID = {
			name: element.name,
			detail: element.description || "",
			price: (element.default_price as Stripe.Price).unit_amount || -1,
			id: element.id,
			image: element.images[0] || "/placeholder.svg",
			price_id: (element.default_price as Stripe.Price).id,
		}

		products.push(product);
	});

	res.status(200).json(products);
})

function updateProduct(id: string, product: Stripe.Product) {
	for (var i = 0; i < allProducts.length; i++) {
		if (allProducts[i].id == id) {
			const tempPrice = allProducts[i].default_price;
			allProducts[i] = product;
			allProducts[i].default_price = tempPrice;
			return;
		}
	}
}

app.post('/create_product', async(req, res) => {
	const name = req.body.name;
	const description = req.body.description;
	const price = Number(req.body.price);
	var price_id = req.body.price_id;
	const image_url = req.body.image_url;
	const id: string | null = req.body.id;

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
						if ((allProducts[i].default_price as Stripe.Price).unit_amount != price) {
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

app.post('/recaptcha', async (req, res) => {
	const reCAPTCHA_SECRET_KEY = "";
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

app.listen(5000, async () => {
	allProducts = (await stripe.products.list({limit: 100, expand: ["data.default_price"]})).data;
	//console.log(allProducts.length);
	console.log("App listening on port 5000!");
});