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
    password = await hashPassword(password);
    const userId = await this.dbController.getUserIdByEmail(email);
    const userResult = await this.dbController.get(userId);
    const userPassword = await this.dbController.getUserPasswordById(userId);
    if (userPassword == password) {
      return { userResult, passwordResult };
    }
    return false;
  }
}
