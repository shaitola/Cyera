import { test, expect, APIRequestContext } from '@playwright/test';
import * as fs from 'fs/promises'; // Import the file system module (async/await version)
import path from 'path'; // Import the path module
import {waitForCartToBeEmpty} from '../api/api'

const API_URL = 'http://localhost:3001';
const DB_FILE_PATH = path.join(__dirname, '../api/mock/db.json'); 

test.describe('mokc API tests', () => {
    let apiContext: APIRequestContext;
    let products: any[] = []; // Store fetched products

    test.beforeAll(async ({ request }) => {
        apiContext = request; // Initialize the APIRequestContext
        const response = await request.get(`${API_URL}/products`);
        expect(response.status()).toBe(200);
        products = await response.json();
        const dbData = JSON.parse(await fs.readFile(DB_FILE_PATH, 'utf8')); // Read db.json
        dbData.cart = []; // Clear the cart
        await fs.writeFile(DB_FILE_PATH, JSON.stringify(dbData, null, 2), 'utf8'); // Write back
        console.log('db.json cart reset successfully');

        await waitForCartToBeEmpty(API_URL, request); // Wait for the cart to be empty
    });


  test('should fetch products', async ({ request }) => {  
    const response = await request.get(`${API_URL}/products`); 
    expect(response.status()).toBe(200);
    products = await response.json(); // Store fetched products
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('price');
  });

  test('should add product to cart', async ({ request }) => { 
    expect(products).toBeDefined(); // Make sure products were fetched
    const productToAdd = products[0]; // Add the first product (you can choose any)
    const quantityToAdd = 2;

        const response = await request.post(`${API_URL}/cart`, {
            data: { ...productToAdd, quantity: quantityToAdd }, // Send the complete product data + quantity
        });
        expect(response.status()).toBe(201);

        const cartResponse = await request.get(`${API_URL}/cart`);
        expect(cartResponse.status()).toBe(200);
        const cartItems = await cartResponse.json();
        expect(cartItems.length).toBe(1);

        const addedProduct = cartItems[0];
        expect(addedProduct.id).toBe(productToAdd.id);
        expect(addedProduct.name).toBe(productToAdd.name); 
        expect(addedProduct.price).toBe(productToAdd.price);
        expect(addedProduct.quantity).toBe(quantityToAdd); 
  });

  test('should retrieve cart items', async ({ request }) => { 
        // Add a product to the cart first (using fetched products)
        expect(products).toBeDefined();
        const productToAdd = products[1]; // Add a different product

        const quantityToAdd = 3;
        await request.post(`${API_URL}/cart`, { data: { ...productToAdd, quantity: quantityToAdd} });

        const response = await request.get(`${API_URL}/cart`);
        expect(response.status()).toBe(200);
        const cartItems = await response.json();
        expect(cartItems.length).toBe(2); // Expecting 2 item in cart
        expect(cartItems[1].id).toBe(productToAdd.id);
        expect(cartItems[1].quantity).toBe(quantityToAdd);
        expect(cartItems[1].name).toBe(productToAdd.name); 
        expect(cartItems[1].price).toBe(productToAdd.price);
  });
});