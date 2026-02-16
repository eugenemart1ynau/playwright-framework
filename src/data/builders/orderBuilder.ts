import { faker } from '@faker-js/faker';
import { User } from '../models/user';
import { Product } from './productBuilder';
import { Address } from './addressBuilder';

/**
 * Order builder for creating test orders.
 * Useful for e-commerce checkout flow tests.
 */
export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  orderNumber: string;
  user: User;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
}

export class OrderBuilder {
  private order: Partial<Order> = {};

  withOrderNumber(orderNumber: string): this {
    this.order.orderNumber = orderNumber;
    return this;
  }

  withUser(user: User): this {
    this.order.user = user;
    return this;
  }

  withItems(items: OrderItem[]): this {
    this.order.items = items;
    return this;
  }

  withShippingAddress(address: Address): this {
    this.order.shippingAddress = address;
    return this;
  }

  withBillingAddress(address: Address): this {
    this.order.billingAddress = address;
    return this;
  }

  withStatus(status: Order['status']): this {
    this.order.status = status;
    return this;
  }

  withPaymentMethod(method: string): this {
    this.order.paymentMethod = method;
    return this;
  }

  /**
   * Build an order with realistic defaults.
   */
  build(): Order {
    const items = this.order.items ?? [
      {
        product: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
          sku: faker.string.alphanumeric(10).toUpperCase(),
          category: faker.commerce.department(),
          inStock: true,
        },
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      },
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      orderNumber: this.order.orderNumber ?? `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
      user: this.order.user ?? {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
      items,
      shippingAddress: this.order.shippingAddress ?? {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        country: 'United States',
      },
      billingAddress: this.order.billingAddress,
      total: subtotal,
      status: this.order.status ?? 'pending',
      paymentMethod: this.order.paymentMethod ?? 'Credit Card',
    };
  }

  /**
   * Build a simple order with one item.
   */
  buildSimple(): Order {
    return this.withItems([
      {
        product: {
          name: 'Test Product',
          description: 'A test product',
          price: 29.99,
          sku: 'TEST-001',
          category: 'Test',
          inStock: true,
        },
        quantity: 1,
        price: 29.99,
      },
    ]).build();
  }

  reset(): this {
    this.order = {};
    return this;
  }
}
