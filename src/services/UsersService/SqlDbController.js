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
}
