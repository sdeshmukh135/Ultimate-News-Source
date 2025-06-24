const router = require('express').Router()
const bcrypt = require('bcrypt')
const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient();

router.post('/signup', async(req, res) => {
    try {
        const {username, password} = req.body

    if (!username || !password) { // purposefully ambigious
        return res.status(400).json({error: "Username and password are required"})
    }

    if (password.length < 8) {
        return res.status(400).json({error: "password must be at least 8 characters long"})
    }

    const exisitingUser = await prisma.user.findUnique({
        where: {username}
    })

    if (exisitingUser) {
        // if there is an existing user
        return res.status(400).json({error: "User already exists"})
    }

    const hashedPassword = await bcrypt.hash(password, 10); // where 10 is the number of times the password is hashed

    const newUser = await prisma.user.create({
        data: {
            username,
            password:hashedPassword,
        }
    })

    res.status(201).json({message: "Sign in Successful!"})
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong with signing up"})
    }
    
})

// login
router.post("/login", async(req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password) {
            // if one of them is empty
            return res.status(401).json({error: "Both username and password are required"})
        }

        const oldUser = await prisma.user.findUnique({
            where:{username}
        })

        if (!oldUser) {
            // user does not exist
            return res.status(401).json({error: "invalid username or password"})
        }

        
        const isValidPassword = await bcrypt.compare(password, oldUser.password);

        if (!isValidPassword) {
            return res.status(401).json({error: "invalid username or password"})
        }

        res.json({message: "Login successful"})
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong with the login"})
    }
});

module.exports = router