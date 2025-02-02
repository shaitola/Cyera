import { APIRequestContext, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_API_URL = 'https://api.demoblaze.com';

export async function fetchProducts(apiRequest: APIRequestContext, categories: string[]) {
    let apiProducts: { id: string; name: string; price: string; image: string; desc: string }[] = [];

    for (const category of categories) {
        const response = await apiRequest.post(`${BASE_API_URL}/bycat`, {
            data: { cat: category }
        });
        const json = await response.json();

        // Extract product details from API response
        const products = json.Items.map((item: { desc: string, id: string ,title: string; price: number; img: string }) => ({
            desc: normalizeText(item.desc),
            id: item.id,
            name: item.title.replace(/\n/g, '').trim(), // Remove newline characters and trim
            price: `$${item.price}`,
            image: item.img
        }));

        apiProducts = apiProducts.concat(products);
    }

    return apiProducts;
}

export async function fetchProductDetails(apiRequest: APIRequestContext, productId: number) {
    const response = await apiRequest.post(`${BASE_API_URL}/view`, {
        data: { id: productId }
    });
    const json = await response.json();

    const normalizeText = (text: string) => text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    return {
        name: json.title.replace(/\n/g, '').trim(), // Remove newline characters and trim
        price: `$${json.price}`,
        description: normalizeText(json.desc) // Normalize description
    };
}

export async function addToCart(apiRequest: APIRequestContext, productId?: number, options?: Partial<{ cookie: string; id: string; flag: boolean }>) {
    const cookie = options?.cookie || `user=${Math.floor(Math.random() * 1000000)}`;
    const id = options?.id || Math.floor(Math.random() * 1e20).toString().padStart(20, '0');
    const flag = options?.flag ?? false;

    const payload: any = {
        cookie,
        id,
        flag
    };

    // Only include prod_id if productId is provided
    if (productId !== undefined) {
        payload.prod_id = productId;
    }

    const response = await apiRequest.post(`${BASE_API_URL}/addtocart`, { data: payload });
    return response;
}

export async function fetchAndWriteProducts(apiRequest: APIRequestContext, categories: string[]) {
    const products = await fetchProducts(apiRequest, categories);

    // Write to 'db.json'
    const filePath = path.resolve(__dirname, '../api/mock/products.json');
    const data = { products };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`All products data saved to ${filePath}`);
}

export async function waitForCartToBeEmpty(base_url: string, request: APIRequestContext, timeout: number = 10000, interval: number = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const cartResponse = await request.get(`${base_url}/cart`);
        expect(cartResponse.status()).toBe(200);
        const cartItems = await cartResponse.json();
        if (cartItems.length === 0) {
            return; // Cart is empty!
        }
        await new Promise(resolve => setTimeout(resolve, interval)); // Wait a bit
    }
    throw new Error('Timeout waiting for cart to be empty'); // Timeout if it's not empty after a while
}

export async function simulateInvalidPayload(apiRequest: APIRequestContext) {
    const response = await apiRequest.post(`${BASE_API_URL}/addtocart`, {
        data: { invalidField: 'invalidValue' } // Invalid payload
    });
    return response;
}

function normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace characters (including newlines) with a single space
      .replace(/(\w)\n(\w)/g, '$1 $2') // Add space between words separated by newline
      .trim(); // Remove leading/trailing whitespace
  }