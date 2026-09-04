// Импортируем фреймворк
import express from "express";
import cors from "cors";
import jsonfile from "jsonfile";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;
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
