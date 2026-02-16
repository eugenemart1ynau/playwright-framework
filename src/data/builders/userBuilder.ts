import { faker } from '@faker-js/faker';
import { User } from '../models/user';

/**
 * UserBuilder implements the Builder pattern for creating test users.
 * 
 * Why builder pattern? It makes test data creation readable and flexible:
 * - Smart defaults via faker (no need to specify everything)
 * - Easy overrides for specific test needs
 * - Fluent API that reads like English
 * 
 * @example
 * // Use defaults
 * const user = new UserBuilder().build();
 * 
 * // Override specific fields
 * const admin = new UserBuilder()
 *   .withEmail('admin@example.com')
 *   .withPassword('SecurePass123!')
 *   .build();
 */
export class UserBuilder {
  private user: Partial<User> = {};

  /**
   * Set a custom email. If not called, faker generates one.
   */
  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  /**
   * Set a custom password. If not called, faker generates a secure one.
   */
  withPassword(password: string): this {
    this.user.password = password;
    return this;
  }

  /**
   * Set custom first name. If not called, faker generates one.
   */
  withFirstName(firstName: string): this {
    this.user.firstName = firstName;
    return this;
  }

  /**
   * Set custom last name. If not called, faker generates one.
   */
  withLastName(lastName: string): this {
    this.user.lastName = lastName;
    return this;
  }

  /**
   * Set custom phone number. If not called, phone is undefined (optional field).
   */
  withPhone(phone: string): this {
    this.user.phone = phone;
    return this;
  }

  /**
   * Build the final User object with all defaults filled in.
   * 
   * We generate defaults here so they're fresh each time build() is called,
   * which is important if you're creating multiple users in one test.
   */
  build(): User {
    return {
      firstName: this.user.firstName ?? faker.person.firstName(),
      lastName: this.user.lastName ?? faker.person.lastName(),
      email: this.user.email ?? faker.internet.email(),
      password: this.user.password ?? faker.internet.password({ length: 12 }),
      phone: this.user.phone,
    };
  }
}
