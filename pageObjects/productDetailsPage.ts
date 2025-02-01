import { Page } from '@playwright/test';

export class ProductDetailsPage {
  constructor(private page: Page) {}

  async getProductDetails() {
    const name = await this.page.$eval('.name', el => el.textContent?.trim());
    const priceText = await this.page.$eval('.price-container', el => el.textContent?.trim() || '');
    const price = priceText.replace(/\s*\*includes tax.*/, '');
    const description = await this.page.evaluate(() => {
        const el = document.querySelector('#more-information p');
        const text = el ? el.textContent || '' : '';
        return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    });

    return { name, price, description };
}

async addToCart() {
  await this.page.click('a.btn.btn-success.btn-lg:has-text("Add to cart")');
}

}