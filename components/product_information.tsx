class ProductDisplay {
    price_to_decimal(price: number): string {
        // price is integer representing cents
        // divide by 100 and then convert to string to display
        const formatter = new Intl.NumberFormat("en-us", {
            style: "currency",
            currency: "USD",
        })
        return formatter.format(price/100);
    }

    price_to_decimal_without_symbol(price: number): string {
        // price is integer representing cents
        // divide by 100 and then convert to string to display
        const formatter = new Intl.NumberFormat("en-us", {
            style: "currency",
            currency: "USD",
            currencyDisplay: "code",
            useGrouping: false
        })
        return formatter.format(price/100).replace("USD", "").trim();
    }

    async get_products(start: Number, amount: Number): Promise<ProductWithID[]> {
        const res = await fetch(`http://localhost:5000/get_products?start=${start}&amount=${amount}`);
        const products = await res.json();
        return products;
    }
}

export type ProductWithID = {
    name: string;
    detail: string;
    price: number;
    id: string | null;
	price_id: string | null;
    image: string;
};

export const productDisplay = new ProductDisplay();
