import { test, expect } from '@playwright/test';
import {addToCart, fetchProducts } from '../api/api';

test('Validate error response for invalid API payload', async ({ request }) => {
    const response = await addToCart(request); 
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.errorMessage).toBeDefined(); // Ensure error message is present
});

test('Fetch all products', async ({ request }) => {
    const categories = ['phone', 'notebook', 'monitor'];
    const products = await fetchProducts(request, categories);
    expect(products.length).toBeGreaterThan(0); // Ensure products are returned

    products.forEach(product => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
    });
});

test('Add valid product to cart', async ({ request }) => {
    const validProductId = 1; // Replace with a valid product ID
    const response = await addToCart(request, validProductId);
    expect(response.status()).toBe(200);
});