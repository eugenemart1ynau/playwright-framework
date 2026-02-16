import { faker } from '@faker-js/faker';

/**
 * Product builder for creating test products.
 * Useful for e-commerce or product catalog tests.
 */
export interface Product {
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  inStock: boolean;
  quantity?: number;
}

export class ProductBuilder {
  private product: Partial<Product> = {};

  withName(name: string): this {
    this.product.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.product.description = description;
    return this;
  }

  withPrice(price: number): this {
    this.product.price = price;
    return this;
  }

  withSku(sku: string): this {
    this.product.sku = sku;
    return this;
  }

  withCategory(category: string): this {
    this.product.category = category;
    return this;
  }

  withStockStatus(inStock: boolean): this {
    this.product.inStock = inStock;
    return this;
  }

  withQuantity(quantity: number): this {
    this.product.quantity = quantity;
    return this;
  }

  /**
   * Build a product with realistic defaults.
   */
  build(): Product {
    return {
      name: this.product.name ?? faker.commerce.productName(),
      description: this.product.description ?? faker.commerce.productDescription(),
      price: this.product.price ?? parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      sku: this.product.sku ?? faker.string.alphanumeric(10).toUpperCase(),
      category: this.product.category ?? faker.commerce.department(),
      inStock: this.product.inStock ?? faker.datatype.boolean(),
      quantity: this.product.quantity,
    };
  }

  /**
   * Build an in-stock product.
   */
  buildInStock(): Product {
    return this.withStockStatus(true).build();
  }

  /**
   * Build an out-of-stock product.
   */
  buildOutOfStock(): Product {
    return this.withStockStatus(false).build();
  }

  reset(): this {
    this.product = {};
    return this;
  }
}
