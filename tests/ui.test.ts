import { HomePage } from '../pageObjects/HomePage';
import { ProductCatalogPage } from '../pageObjects/productCatalogPage';
import { fetchProducts , fetchProductDetails } from '../api/api';
import { test, expect } from '@playwright/test';
import { ProductDetailsPage } from '../pageObjects/productDetailsPage';
let homePage: HomePage;
let categories: string[] = [];

test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
});

test('Verify all products from API are displayed in UI', async ({ request }) => {
    categories = await homePage.getCategories();
    expect(categories).toBeDefined(); // Make sure categories are fetched
    
    const apiProducts = await fetchProducts(request, categories);

    const uiProducts = await homePage.getAllProducts(); // Extract from UI

    // Normalize UI product names
    const normalizedUIProducts = uiProducts.map(product => ({
        ...product,
        desc: product.desc.replace(/\n/g, '').trim(), // Remove newline characters and trim
        name: product.name.replace(/\n/g, '').trim() // Remove newline characters and trim
    }));


        // Sort both lists by product name
        apiProducts.sort((a, b) => a.name.localeCompare(b.name));
        normalizedUIProducts.sort((a, b) => a.name.localeCompare(b.name));

    // Compare the sorted and normalized lists
    expect(normalizedUIProducts).toEqual(apiProducts);
});

test('Verify product details match between API and UI', async ({ page, request }) => {
    const productLinks = await homePage.getAllProductLinks();// Extract from UI

    for (const productLink of productLinks) {
        await homePage.clickOnProductByHref(productLink.href);
        const productDetails = new ProductDetailsPage(page);

        const uiProductDetails = await productDetails.getProductDetails();
        const apiProductDetails = await fetchProductDetails(request, productLink.id);

        expect(uiProductDetails.name).toBe(apiProductDetails.name);
        expect(uiProductDetails.price).toBe(apiProductDetails.price);
        expect(uiProductDetails.description).toBe(apiProductDetails.description);

        // Navigate back to the home page to continue with the next product
        await homePage.navigate();
    }
});

test('Verify Add to Cart functionality', async ({ page }) => {
    const productLinks = await homePage.getAllProductLinks(); // Extract from UI

    for (const productLink of productLinks) {
        await homePage.clickOnProductByHref(productLink.href);

        // Intercept the POST request to validate the prod_id
        await page.route('https://api.demoblaze.com/addtocart', route => {
            const postData = route.request().postDataJSON();
            expect(postData.prod_id).toBe(productLink.id);
            route.continue();
        });
        const productDetails = new ProductDetailsPage(page);

        // Click 'Add to Cart' button
        await productDetails.addToCart();

        // Validate confirmation popup
        page.on('dialog', async dialog => {
            expect(dialog.message()).toBe('Product added');
            await dialog.accept();
        });

        // Navigate back to the home page to continue with the next product
        await homePage.navigate();
    }
});

test('Verify error response and empty page for invalid product ID', async ({ page }) => {
    // Intercept the API call to verify the 500 error
    await page.route('https://api.demoblaze.com/view', route => {
    route.continue();
    });

  // Navigate to an invalid product page
  await page.goto('/prod.html?idp_=text');

    // Verify the server returns a 500 error for the API call
    const response = await page.waitForResponse(response => response.url().includes('view') && response.status() === 500);
    expect(response.status()).toBe(500);

  // Verify the page has no data
  const productTitle = await page.$('.product-title');
  const productPrice = await page.$('.product-price');
  const productDescription = await page.$('.product-description');

  expect(productTitle).toBeNull();
  expect(productPrice).toBeNull();
  expect(productDescription).toBeNull();
});

test('Verify page content for non-existing product ID', async ({ page }) => {
  // Get all existing product IDs
  const productLinks = await homePage.getAllProductLinks();
  const existingIds = productLinks.map(link => link.id);

  // Find a non-existing product ID
  let nonExistingId = 1;
  while (existingIds.includes(nonExistingId)) {
      nonExistingId++;
  }
  const productCatalog = new ProductCatalogPage(page);
  // Navigate to a non-existing product page
  await page.goto(`/prod.html?idp_=${nonExistingId}`);

  // Verify the page content
  const productName = await page.textContent('[class="name"]');
  const productPrice = await page.textContent('.price-container');
  const productDescription = await page.textContent('#more-information p');

  expect(productName).toBe('undefined');
  expect(productPrice).toContain('$undefined');
  expect(productDescription).toBe('undefined');
});