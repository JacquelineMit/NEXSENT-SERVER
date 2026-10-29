export class UserService {
  constructor(dbController) {
    this.dbController = dbController;
  }

  async create(name, email, phone, gender) {
    const result = await this.dbController.create(name, email, phone, gender);
    console.log("UserService: create, result is ", result);
    return result;
  }

  async update() {}

  async delete() {}
}
