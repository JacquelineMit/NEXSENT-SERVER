import { Pool } from "pg";

export class SqlDbController {
  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create(name, email, phone, gender) {
    console.log("SqlDbController: create");
    const result = await this.db.query(
      `
        INSERT INTO users (name, email, phone, gender)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, phone, gender
      `,
      [name, email, phone, gender],
    );
    const data = result.rows[0];

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
    };
  }

  async update(name, email, phone, gender, id) {
    console.log("SqlDbController: update");
    const result = await this.db.query(
      `
      UPDATE users 
      SET name = $1, 
      email = $2,
      phone = $3,
      gender = $4,
      WHERE id = $5
      `,
      [name, email, phone, gender, id],
    );
    const data = result.rows[0];

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
    };
  }

  async delete(id) {
    console.log("SqlDbController: delete");
    const result = await this.db.query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [id],
    );
    const data = result.rows[0];

    return {
      id: data.id,
    };
  }

  async get(id) {
    console.log("SqlDbController: get");
    const result = await this.db.query(
      `
      SELECT id, name, email, phone, gender FROM users
      WHERE id = $1
      `,
      [id],
    );
    const data = result.rows[0];

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
    };
  }

  async getAll() {
    console.log("SqlDbController: get all");
    const result = await this.db.query(
      `
      SELECT * FROM users
      `,
    );
    const data = result.rows;
    return data;
  }

  async savePassword(id, password, createdAt) {
    const result = await this.db.query(
      `
      INSERT INTO users_passwords (user_id, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, password, created_at, updated_at
      `,
      [id, password, createdAt, createdAt],
    );
    const data = result.rows[0];

    return {
      id: data.user_id,
      password: data.password,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getUserIdByEmail(email) {
    const result = await this.db.query(
      `
      SELECT id FROM users
      WHERE email = $1
      `,
      [email],
    );

    return result.rows[0].id;
  }

  async getUserPasswordById(id) {
    const result = await this.db.query(
      `
      SELECT password FROM users_passwords
      WHERE user_id = $1
      `,
      [id],
    );
    return result.rows[0].password;
  }
}
