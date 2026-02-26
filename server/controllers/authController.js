import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';


export const register = async (req,res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password){
        return res.json({success: false, message:"Details are missing"})
    }

    try {
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
    }catch(error){
        res.json( {success: false, message:"something went wrong"})
    }
}