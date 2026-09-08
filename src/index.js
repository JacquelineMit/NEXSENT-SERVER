// Импортируем фреймворк
import express from "express";
import cors from "cors";
import jsonfile from "jsonfile";
import path from "path";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser("my-secret-key"));

// Middleware для парсинга JSON в теле запроса
app.use(express.json());

// enabling CORS for any unknown origin(https://xyz.example.com)
app.use(cors());

// Простой проверочный маршрут
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

const dataFile = path.resolve("users.json");

async function readUsers() {
  try {
    return await jsonfile.readFile(dataFile);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeUsers(users) {
  await jsonfile.writeFile(dataFile, users, { spaces: 2 });
}

app.post("/send", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const users = await readUsers();
  users.push({ name, email });
  await writeUsers(users);

  /*
  res.cookie("name", name, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
  });
  */

  console.log("Cookie is", req.cookies.name);

  res.json({ result: "yes" });
});

app.post("/user/create", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const id = uuidv4();
  const users = await readUsers();
  const user = { id, name, email };
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
app.get("/user/get", async (req, res) => {
  console.log("get");
  const id = req.body.id;
  const users = await readUsers();
  const user = users.findIndex((user) => user.id === id);
  if (!user) {
    return res.status(404).json({ result: "User not found" });
  }
  res.json({ result: "yes" });
});
app.delete("/user/delete", async (req, res) => {
  console.log("delete");
  const id = req.body.id;
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    const user = users.splice(index, 1);
    res.send(user);
  }
  res.json({ result: "yes" });
});
