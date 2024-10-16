import bcrypt from "bcrypt";

const saltRounds = 12;
const password = "password123"
const hashedPassword = await bcrypt.hash(password, 12);
console.log(hashedPassword)