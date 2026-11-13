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
import { SqlDbController } from "./services/UsersService/SqlDbController.js";
import { UserService } from "./services/UsersService/index.js";
import { Logger } from "./utils/Logger.js";

dotenv.config();

let dbController = new SqlDbController();
let userService = new UserService(dbController);

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

app.get("/autho/me", requireAuth, (req, res) => {
  console.log("CHECK IT");
  res.json({ result: { nickname: req.cookies.nickname || null } });
});

// Простой проверочный маршрут
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  Logger.new().log(`Сервер запущен на порту ${PORT}`);
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

  res.json({ result: users });
});

app.get("/client/get", requireAuth, async (req, res) => {
  res.json({});
});

app.post("/user/create", upload.none(), requireAuth, async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const user = await userService.create(name, email, phone, gender);
  res.json({ result: user });
});

app.put("/user/update", upload.none(), requireAuth, async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const user = await userService.update(name, email, phone, gender, id);
  res.json({ result: user });
});

app.get("/user/get", upload.none(), requireAuth, async (req, res) => {
  console.log("get");
  const id = req.body.id;
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const user = await userService.get(name, email, phone, gender, id);
  res.json({ result: user });
});

app.delete("/user/delete", upload.none(), requireAuth, async (req, res) => {
  console.log("delete");
  const id = req.body.id;
  const user = await userService.delete(id);
  res.json({ result: user });
});

app.get("/users/get", requireAuth, async (req, res) => {
  const result = await db.query(
    `
    SELECT * FROM users
    `,
  );

  res.json({ result: result.rows });
});

app.post("/user/signup", upload.none(), async (req, res) => {
  const name = req.body.name;
  let password = req.body.password;
  const email = req.body.email;
  const result = await userService.signup(name, email, password);

  res.cookie("token", result.passwordResult, {
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
