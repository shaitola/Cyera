import { Page, Locator } from '@playwright/test';

export class HomePage {
    private page: Page;
    private productCards: Locator;
    private nextButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.productCards = page.locator('.card');
        this.nextButton = page.locator('#next2'); 
    }
    async navigate() {
        await this.page.goto('/');
        await this.page.waitForSelector('.card-title'); // Adjust the selector as needed
    }

    async getAllProducts() {
        let products = [];

        do {
            await this.page.waitForSelector('.card', { timeout: 5000 }); // Ensure products load
            const items = await this.productCards.all();

            for (const item of items) {
                const name = await item.locator('.card-title a').innerText();
                const price = await item.locator('.card-block h5').innerText();
                const image = await item.locator('.card-img-top').getAttribute('src');
                const desc = await item.locator('.card-text').innerText();
                const href = await item.locator('.card-title a').getAttribute('href');
                const idMatch = href?.match(/idp_=(\d+)/);
                const id = idMatch ? parseInt(idMatch[1], 10) : null;

                products.push({ name, price, image , desc, id });
            }
        } while (await this.goToNextPage());

        return products;
    }

    async goToNextPage() {
        if (await this.nextButton.isVisible()) {
            await this.nextButton.click();
            await this.page.waitForTimeout(1000); // Allow time for new products to load
            return true;
        }
        return false;
    }

    async clickOnProduct(productName: string) {
        await this.page.click(`text=${productName}`);
        await this.page.waitForSelector('.product-details'); // Adjust the selector as needed
    }

    async getProductDetails() {
        return {
            name: await this.page.$eval('.product-title', el => el.textContent?.trim()),
            price: await this.page.$eval('.product-price', el => el.textContent?.trim()),
            description: await this.page.$eval('.product-description', el => el.textContent?.trim())
        };
    }

    async getProductIdFromUrl() {
        const url = new URL(await this.page.url());
        return parseInt(url.searchParams.get('idp_') || '0', 10);
    }

    async isNextPageAvailable() {
        return this.page.$('.page-link[aria-label="Next"]') !== null;
    }

    async getAllProductLinks() {
        let productLinks: { name: string; id: number; href: string }[] = [];
        do {
            const links = await this.page.$$eval('.card-block a', (anchors: Element[]) =>
                anchors.map(anchor => {
                    const htmlAnchor = anchor as HTMLAnchorElement;
                    return {
                        name: htmlAnchor.querySelector('.card-title')?.textContent?.trim() || 'Unknown',
                        id: parseInt(new URL(htmlAnchor.href).searchParams.get('idp_') ?? '0', 10),
                        href: htmlAnchor.href
                    };
                })
            );
            productLinks = productLinks.concat(links);
        } while (await this.isNextPageAvailable() && await this.goToNextPage());

        return productLinks;
    }

    async clickOnProductByHref(href: string) {
        await this.page.goto(href);
        await this.page.waitForSelector('[class="btn btn-success btn-lg"]');
    }

    async getCategories() {
        const categories = await this.page.$$eval('.list-group a', (elements: Element[]) =>
            elements.map(element => {
                const onclickValue = (element as HTMLElement).getAttribute('onclick');
                const match = onclickValue?.match(/byCat\('(.+?)'\)/);
                return match ? match[1] : null;
            }).filter(category => category !== null)
        );
        return categories as string[];
    }
}
