const router = require("express").Router();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const {
  addToWindows, // function to add to intervals
} = require("../scheduler");

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

    const timeLoggedIn = new Date();
    if (!oldUser.timesOnline) {
      // no times so far
      const timeOnline = {
        time: [timeLoggedIn],
      };
      const updatedTime = await prisma.user.update({
        where: { id: oldUser.id },
        data: {
          timesOnline: JSON.stringify(timeOnline),
        },
      });
    } else {
      // there are times
      let prevTimes = JSON.parse(oldUser.timesOnline)["time"];
      prevTimes.push(timeLoggedIn); // array of times user has logged on
      const timeOnline = {
        time: prevTimes,
      };
      const updatedTime = await prisma.user.update({
        where: { id: oldUser.id },
        data: {
          timesOnline: JSON.stringify(timeOnline),
        },
      });
    }

    req.session.userId = oldUser.id;
    req.session.username = oldUser.username;
    res.json({ id: oldUser.id, username: oldUser.username }); // returning userId and username of the session
  } catch (err) {
    res.status(500).json({ error: "Something went wrong with the login" });
  }
});

// logout
router.post("/logout", async (req, res) => {
  const oldUser = await prisma.user.findUnique({
    where: { id: req.session.userId },
  });

  const timeLoggedOut = new Date(); // right now

  const loginTimes = JSON.parse(oldUser.timesOnline)["time"];

  const mostRecentLogin = loginTimes[loginTimes.length - 1];

  addToWindows(mostRecentLogin, timeLoggedOut);

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.json({ message: "Logged out successfully" });
  });
});

// route for before session expires
router.post("/before-expired", async (req, res) => {
  // same as logout but without destroying the session (will already be destroyed when it expires)
  const oldUser = await prisma.user.findUnique({
    where: { id: req.session.userId },
  });

  try {
    const timeLoggedOut = new Date(); // right now

    const loginTimes = JSON.parse(oldUser.timesOnline)["time"];

    const mostRecentLogin = loginTimes[loginTimes.length - 1];

    await addToWindows(mostRecentLogin, timeLoggedOut);
    res.status(200).json({ message: "Added intervals successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to update windows" });
  }
});

const getRandomLoginTime = (startDate, endDate) => {
  return new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
};

const getRandomLogoutTime = (startHours, endHours, loginDate) => {
  const minMs = startHours * 60 * 60 * 1000;
  const maxMs = endHours * 60 * 60 * 1000;

  const randDuration = minMs + Math.random() * (maxMs - minMs);
  return new Date(loginDate.getTime() + randDuration);
};

// seed a bunch of interval times to test
router.post("/seed-times", async (req, res) => {
  const startDate = new Date(2025, 6, 1);
  const endDate = new Date(2025, 7, 23);

  try {
    for (let i = 0; i < 40; i++) {
      // 40 random intervals
      const loginTime = getRandomLoginTime(startDate, endDate);
      const logoutTime = getRandomLogoutTime(1, 5, loginTime);

      await addToWindows(loginTime, logoutTime);
    }

    const times = await prisma.onlineTime.findMany();
    res.status(200).json(times);
  } catch (error) {
    res.status(500).json({ error: "Unable to seed login-logout times" });
  }
});

// clear existing login times
router.delete("/delete-login-times", async (req, res) => {
  const updateLogin = await prisma.user.update({
    where: { id: req.session.userId },
    data: {
      timesOnline: {}, // empty the times
    },
  });

  res.status(200).json({ message: "Deleted login times successfully!" });
});

module.exports = router;
