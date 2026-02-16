import { faker } from '@faker-js/faker';

/**
 * Address builder for creating test addresses.
 * Useful for forms that require address information.
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class AddressBuilder {
  private address: Partial<Address> = {};

  withStreet(street: string): this {
    this.address.street = street;
    return this;
  }

  withCity(city: string): this {
    this.address.city = city;
    return this;
  }

  withState(state: string): this {
    this.address.state = state;
    return this;
  }

  withZipCode(zipCode: string): this {
    this.address.zipCode = zipCode;
    return this;
  }

  withCountry(country: string): this {
    this.address.country = country;
    return this;
  }

  /**
   * Build a US address with realistic data.
   */
  buildUS(): Address {
    return {
      street: this.address.street ?? faker.location.streetAddress(),
      city: this.address.city ?? faker.location.city(),
      state: this.address.state ?? faker.location.state({ abbreviated: true }),
      zipCode: this.address.zipCode ?? faker.location.zipCode(),
      country: this.address.country ?? 'United States',
    };
  }

  /**
   * Build an address with defaults filled in.
   */
  build(): Address {
    return {
      street: this.address.street ?? faker.location.streetAddress(),
      city: this.address.city ?? faker.location.city(),
      state: this.address.state ?? faker.location.state(),
      zipCode: this.address.zipCode ?? faker.location.zipCode(),
      country: this.address.country ?? faker.location.country(),
    };
  }

  reset(): this {
    this.address = {};
    return this;
  }
}
