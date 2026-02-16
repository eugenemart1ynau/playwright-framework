/**
 * User model. This represents the shape of user data we work with in tests.
 * 
 * We keep models separate from builders so the data structure is clear
 * and reusable across different builders if needed.
 */
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}
