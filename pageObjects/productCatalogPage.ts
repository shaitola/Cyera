import { Page } from '@playwright/test';

export class ProductCatalogPage {
  constructor(private page: Page) {}

  async clickOnProduct(productName: string) {
    await this.page.click(`text=${productName}`);
  }

}