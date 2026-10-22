// Импортируем фреймворк
import express from "express";
import cors from "cors";
import jsonfile from "jsonfile";
import path from "path";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { hashPassword, verifyPassword } from "./utils/password.js";
import { Pool } from "pg";
import dotenv from "dotenv";
import { requireAuth } from "./middleware/requireAuth.js";

dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const upload = multer();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser("my-secret-key"));

// Middleware для парсинга JSON в теле запроса
app.use(express.json());

// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  }),
);

// Простой проверочный маршрут
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

const usersDb = path.resolve("db/users.json");

async function readUsers() {
  try {
    return await jsonfile.readFile(usersDb);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeUsers(users) {
  await jsonfile.writeFile(usersDb, users, { spaces: 2 });
}

app.post("/send", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const users = await readUsers();
  users.push({ name, email });
  await writeUsers(users);

  res.cookie("name", name, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  console.log("Cookie is", req.cookies.name);

  res.json({ result: users });
});

app.post("/user/create", upload.none(), requireAuth, async (req, res) => {
  const id = uuidv4();
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const create = await db.query(
    `
    INSERT INTO users (name, email, phone, gender)
    VALUES ($1, $2, $3, $4)
    `,
    [name, email, phone, gender],
  );
  res.json({ result: create.rows[0] });
});
app.put("/user/update", upload.none(), requireAuth, async (req, res) => {
  console.log("update");
  const id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const update = await db.query(
    `
    UPDATE users 
    SET name = $1,
        email = $2,
        phone = $3,
        gender = $4
    WHERE id = $5
    `,
    [name, email, phone, gender, id],
  );
  res.json({ result: update.rows });
});
app.get("/user/get", upload.none(), requireAuth, async (req, res) => {
  console.log("get");
  const id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const result = await db.query(
    `
    SELECT id, name, email, phone, gender FROM users
    WHERE id = $1
    `,
    [id, name, email, phone, gender],
  );
  res.json({ result: result.rows });
});
app.delete("/user/delete", upload.none(), requireAuth, async (req, res) => {
  console.log("delete");
  const id = req.body.id;
  await db.query(
    `
    DELETE FROM users
    WHERE id = $1
    `,
    [id],
  );
  const result = await db.query(
    `
    SELECT * FROM users
    `,
  );
  res.json({ result: result.rows });
});

app.get("/users/get", requireAuth, async (req, res) => {
  const result = await db.query(
    `
    SELECT * FROM users
    `,
  );
  //const users = await readUsers();
  res.json({ result: result.rows });
});

app.post("/user/signup", upload.none(), async (req, res) => {
  const id = uuidv4();
  const name = req.body.name;
  let password = req.body.password;
  const email = req.body.email;
  const users = await readUsers();
  password = await hashPassword(password);
  const user = { id, name, password, email };
  console.log(users);
  users.push(user);
  await writeUsers(users);
  console.log("Signup");
  res.cookie("token", password, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.cookie("nickname", name, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ result: "yes" });
});

app.post("/user/signin", upload.none(), async (req, res) => {
  const email = req.body.email;
  let password = req.body.password;
  const users = await readUsers();
  const user = users.find((user) => user.email === email);
  if (user && verifyPassword(password, user.password)) {
    res.cookie("token", user.password, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.cookie("nickname", user.name, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.json({ result: "yes" });
    return;
  }

  res.json({ result: "no" });
});
