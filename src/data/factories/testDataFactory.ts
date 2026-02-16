import { UserBuilder, User } from '../builders/userBuilder';
import { AddressBuilder, Address } from '../builders/addressBuilder';
import { ProductBuilder, Product } from '../builders/productBuilder';
import { OrderBuilder, Order } from '../builders/orderBuilder';

/**
 * Test data factory - centralized place to create test data.
 * 
 * This factory provides convenient methods to create common test data
 * scenarios. Use it when you need consistent test data across tests.
 */
export class TestDataFactory {
  /**
   * Create a standard test user.
   */
  static createUser(overrides?: Partial<User>): User {
    const builder = new UserBuilder();
    if (overrides?.email) builder.withEmail(overrides.email);
    if (overrides?.password) builder.withPassword(overrides.password);
    if (overrides?.firstName) builder.withFirstName(overrides.firstName);
    if (overrides?.lastName) builder.withLastName(overrides.lastName);
    if (overrides?.phone) builder.withPhone(overrides.phone);
    return builder.build();
  }

  /**
   * Create an admin user.
   */
  static createAdminUser(): User {
    return new UserBuilder()
      .withEmail('admin@example.com')
      .withPassword('AdminPass123!')
      .withFirstName('Admin')
      .withLastName('User')
      .build();
  }

  /**
   * Create a standard test address.
   */
  static createAddress(overrides?: Partial<Address>): Address {
    const builder = new AddressBuilder();
    if (overrides?.street) builder.withStreet(overrides.street);
    if (overrides?.city) builder.withCity(overrides.city);
    if (overrides?.state) builder.withState(overrides.state);
    if (overrides?.zipCode) builder.withZipCode(overrides.zipCode);
    if (overrides?.country) builder.withCountry(overrides.country);
    return builder.build();
  }

  /**
   * Create a US address.
   */
  static createUSAddress(): Address {
    return new AddressBuilder().buildUS();
  }

  /**
   * Create a test product.
   */
  static createProduct(overrides?: Partial<Product>): Product {
    const builder = new ProductBuilder();
    if (overrides?.name) builder.withName(overrides.name);
    if (overrides?.price) builder.withPrice(overrides.price);
    if (overrides?.category) builder.withCategory(overrides.category);
    if (overrides?.inStock !== undefined) builder.withStockStatus(overrides.inStock);
    return builder.build();
  }

  /**
   * Create an in-stock product.
   */
  static createInStockProduct(): Product {
    return new ProductBuilder().buildInStock();
  }

  /**
   * Create an out-of-stock product.
   */
  static createOutOfStockProduct(): Product {
    return new ProductBuilder().buildOutOfStock();
  }

  /**
   * Create a test order.
   */
  static createOrder(overrides?: Partial<Order>): Order {
    const builder = new OrderBuilder();
    if (overrides?.user) builder.withUser(overrides.user);
    if (overrides?.items) builder.withItems(overrides.items);
    if (overrides?.shippingAddress) builder.withShippingAddress(overrides.shippingAddress);
    if (overrides?.status) builder.withStatus(overrides.status);
    return builder.build();
  }

  /**
   * Create a simple order with one item.
   */
  static createSimpleOrder(): Order {
    return new OrderBuilder().buildSimple();
  }

  /**
   * Create multiple users at once. Useful for bulk operations.
   */
  static createUsers(count: number): User[] {
    return Array.from({ length: count }, () => this.createUser());
  }

  /**
   * Create multiple products at once.
   */
  static createProducts(count: number, category?: string): Product[] {
    return Array.from({ length: count }, () =>
      this.createProduct(category ? { category } : undefined)
    );
  }
}
