import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma.js";

export const register = async (req,res)=>{
    try{
    const {username,email,password} = req.body;
    const hashedpassword=await bcrypt.hash(password,10);
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });
    
        if (existingUser) {
            console.log("Username is already taken")
            return res.status(400).json({ error: 'Username already exists' });
        }
    const newUser= await prisma.user.create({
        data:{
            username,
            email,
            password:  hashedpassword
        },
    });
    
    console.log(newUser);
    res.status(201).json({message:"User created successfully"})
}catch(err){
    console.log(err);
    res.status(500).json({message:"Failed to create User!"})
}
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const age = 1000 * 60 * 60 * 24 * 7;

        const token = jwt.sign(
            {
                id: user.id,
                isAdmin: true,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: age,
            }
        );

        const { password: userPassword, ...userInfo } = user;

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: age,
        });
        
        return res.status(200).json(userInfo);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to Login" });
    }
};

export const logout = (req,res)=>{
    res.clearCookie("token");
    res.status(200).json({message:"Logout successfull"})
}