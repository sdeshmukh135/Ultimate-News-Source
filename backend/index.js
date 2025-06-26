const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const articleRoutes = require("./routes/articles");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5175", // Replace with your frontend's origin
    credentials: true,
  }),
);

let sessionConfig = {
  name: "sessionId",
  secret: process.env.SECRET_KEY,
  cookie: {
    maxAge: 1000 * 60 * 5,
    secure: false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
};

app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // For Additional Prisma Checks
  res.status(500).json({ error: "Internal Server Error" });
});

app.use(session(sessionConfig));
app.use(authRoutes);
app.use("/news", newsRoutes);
app.use(articleRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
