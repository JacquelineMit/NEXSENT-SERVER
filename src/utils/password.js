import bcrypt from "bcrypt";

const SALT = "fdlisdjfkjad";

export async function hashPassword(password) {
  return await bcrypt.hash(password + SALT, 10);
}

export async function verifyPassword(password, hashPassword) {
  return await bcrypt.compare(password + SALT, hashPassword);
}
