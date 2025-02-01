import { test, expect } from '@playwright/test';
import {addToCart } from '../api/api';

test('Validate error response for invalid API payload', async ({ request }) => {
    const response = await addToCart(request, 12345); // Invalid product ID
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.errorMessage).toBeDefined(); // Ensure error message is present
});
