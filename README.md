# Cyera Automation QA Home Task

This repository contains an automated testing suite for an e-commerce website.

## Project Structure

* `tests/ui`: Contains UI tests using Playwright.
* `tests/backend`: Contains backend tests for a mock API.
* `pages`: Contains page objects for the UI tests.

## Getting Started

1. Clone the repository: `git clone https://github.com/shaitola/Cyera.git`
2. Install dependencies: `npm install`
3. Start the mock API server: `npm run mock-api-start-server`
4. Run the mock tests: `npm run mock-api-test`
4. Run the UI tests: `npm run ui-test`
5. Run the backend tests: `npm run api-test`
6. Run the performance tests: `npm run preformance-test`

## Test Scenarios

### UI Tests

* **Product Catalog:** Verifies that all products are displayed with correct details (name, price, and image).
* **Navigation to Product Details:** Checks that clicking a product navigates to the correct details page and validates the product information.
* **Add to Cart:** Tests the 'Add to Cart' button functionality and the confirmation popup.
* **empty page for invalid product ID:**Checks that when navigates to invalid product ID page
* **content for non-existing product ID:**Checks that when navigates to non-existing product ID page
* **Performance Test:** This test measures the time it takes to load the home page and display all products.

### Backend Tests (Mock API)

* **Fetch Products:** Validates the API endpoint for fetching products.
* **Add to Cart:** Tests the API endpoint for adding a product to the cart.
* **Retrieve Cart Items:** Verifies the API endpoint for retrieving cart items.

### Backend Tests (API)

* **Validate error response for invalid API payload:** Validates the API endpoint for invalid API payload.
* **Add to Cart:** Tests the API endpoint for adding a product to the cart.
* **Fetch all products:** Verifies the API endpoint for Fetch all products.

## Assumptions and Limitations

* The mock API is implemented using json-server.
* The tests are written in TypeScript.
* The UI tests are designed for the Demoblaze website.
