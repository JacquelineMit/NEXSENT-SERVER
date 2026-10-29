import { Pool } from "pg";

export class MyDbController {
  constructor() {}

  async create(...args) {
    console.log("MyDbController: create, original args is", args);
    return {
      id: "test-id",
      name: "Test name",
      email: "Test email",
      phone: "Test phone",
      gender: `Hahahaha`,
    };
  }

  async update() {}

  async delete() {}
}
