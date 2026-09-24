// Импортируем фреймворк
import express from "express";
import cors from "cors";
import jsonfile from "jsonfile";
import path from "path";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { hashPassword, verifyPassword } from "./utils/password.js";

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

  res.json({ result: "yes" });
});

app.post("/user/create", upload.none(), async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const id = uuidv4();
  const phone = req.body.phone;
  const gender = req.body.gender;
  const users = await readUsers();
  const user = { id, name, email, gender, phone };
  users.push(user);
  await writeUsers(users);
  console.log("create");
  res.json({ result: user });
});
app.put("/user/update", async (req, res) => {
  console.log("update");
  const name = req.body.name;
  const email = req.body.email;
  const id = req.body.id;
  const users = await readUsers();
  const userIndex = users.findIndex((user) => user.id === id);
  const updatedUser = { ...users[userIndex], name, email };
  users[userIndex] = updatedUser;
  await writeUsers(users);
  res.json({ result: "yes" });
});
app.get("/user/get", upload.none(), async (req, res) => {
  console.log("get");
  const id = req.body.id;
  const users = await readUsers();
  const user = users.findIndex((user) => user.id === id);
  if (!user) {
    return res.status(404).json({ result: "User not found" });
  }
  res.json({ result: user });
});
app.delete("/user/delete", upload.none(), async (req, res) => {
  console.log("delete");
  const id = req.body.id;
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    const user = users.splice(index, 1);
    await writeUsers(users);
    console.log(`Пользователь ${id} был удалён`);
  } else {
    console.log(`Пользователь ${id} не найден`);
  }
  res.json({ result: "yes" });
});

app.get("/users/get", async (req, res) => {
  console.log("get");
  const users = await readUsers();
  res.json({ result: users });
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
