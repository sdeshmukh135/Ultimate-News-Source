const router = require("express").Router();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// get all users (for testing purposes)
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

// get that is logged in (for testing purposes)
router.get("/loggedin", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { username: true }, // Only return necessary data
  });

  res.json({ id: req.session.userId, username: user.username });
});

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      // purposefully ambigious
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be at least 8 characters long" });
    }

    const exisitingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (exisitingUser) {
      // if there is an existing user
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // where 10 is the number of times the password is hashed

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "Signup Successful!" }); // must login in order to get to Home Page, do not need to return userId here
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong with signing up" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      // if one of them is empty
      return res
        .status(401)
        .json({ error: "Both username and password are required" });
    }

    const oldUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!oldUser) {
      // user does not exist
      return res.status(401).json({ error: "invalid username or password" });
    }

    const isValidPassword = await bcrypt.compare(password, oldUser.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "invalid username or password" });
    }

    req.session.userId = oldUser.id;
    req.session.username = oldUser.username;
    res.json({ id: oldUser.id, username: oldUser.username }); // returning userId and username of the session
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong with the login" });
  }
});

// logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
