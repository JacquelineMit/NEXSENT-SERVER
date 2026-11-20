import { hashPassword, verifyPassword } from "../../utils/password.js";

export class UserService {
  constructor(dbController) {
    this.dbController = dbController;
  }

  async create(name, email, phone, gender) {
    const result = await this.dbController.create(name, email, phone, gender);
    console.log("UserService: create, result is ", result);
    return result;
  }

  async update(name, email, phone, gender, id) {
    const result = await this.dbController.update(
      name,
      email,
      phone,
      gender,
      id,
    );
    console.log("UserService: update, result is ", result);
    return result;
  }

  async delete(id) {
    const result = await this.dbController.delete(id);
    console.log("UserService: delete, result is ", result);
    return result;
  }

  async getAll() {
    const result = await this.dbController.getAll();
    console.log("UserService: get all, result is ", result);
    return result;
  }

  async signup(name, email, password) {
    password = await hashPassword(password);
    const userResult = await this.create(name, email);
    const timestamp = new Date();
    const passwordResult = await this.dbController.savePassword(
      userResult.id,
      password,
      timestamp,
    );
    return { userResult, passwordResult };
  }

  async signin(email, password) {
    const userId = await this.dbController.getUserIdByEmail(email);

    if (!userId) return false;

    const userResult = await this.dbController.get(userId);
    if (!userResult) return false;

    const passwordResult = await this.dbController.getUserPasswordById(userId);
    if (!passwordResult) return false;

    const isValid = await verifyPassword(password, passwordResult);
    if (!isValid) return false;

    return { userResult, passwordResult };
  }
}
