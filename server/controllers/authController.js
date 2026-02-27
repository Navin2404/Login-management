import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';


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

        const user = new userModel({name, email, password: hashedPassword});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //Sending welcome mail
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "welcome to Girikalan magic show",
            text: `Welcome to Girikalan magic show. Your account has been created with email id : ${email}`
        } 

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    }catch(error){
        console.error(error)
        res.json( {success: false, message:"something went wrong"})
    }
}


export const login = async(req,res)=> {
    const {email,password} = req.body;
    
    if(!email || !password){
        return res.json({success: false, message:"Email and Password are required"})
    }

    try{
        const user = await userModel.findOne({email});

        if(!user){
            res.json({success:false, message:'Invalid email'})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false, message:"Invalid password"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: "You are LoggedIn"
        });
        

    }catch(error){

    }
}

export const logout = async (req,res)=>{

    try{
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict'
        })

        return res.json({success: true, message: "Logged out"})

    }catch(error){
        return res.json({ success:false, message:error.message });
    }
}


export const sendVerifyOtp = async(req,res)=> {
    try{
        const userID = req.userID;

        const user = await userModel.findById(userID);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account Already Verified"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.sendVerifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();


        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "welcome to Girikalan magic show Account verification",
            text: `You can reset your password, Here is your otp: ${otp}.`
        }

        await transporter.sendMail(mailOptions);

        res.json({success:true, message: 'Verification OTP is sent on email'});

        }catch (error){
            res.json({success: false, message: error.message})
        }
}

export const verifyEmail = async(req,res) => {

    const otp = req.body.otp;         
    const userID = req.userID;  

    if(!userID || !otp){
        return res.json({ success: false, message: 'Please provide otp to continue'})
    }

    try{
        const user = await userModel.findById(userID);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(!user.verifyOtp === '' || !user.verifyOtp !== String(otp)){
            return res.json({success:false, message:"Invalid Otp"});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false, message:"OTP Expired"});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'Email verified successfully'});


    }catch(error){
        return res.json({success:false, message: "Something went wrong"})
    }
}

// check if the user is authencated or not
export const isAuthenticated = async (req, res)=> {


    try{
        return res.json({ success: true, message:"user is authencated"});

    }catch(error){
        res.json({ success: false, message: error.message });
    }
}

export default isAuthenticated


//reset the password using otp 
export const sendResetOtp = async(req,res)=> {
    const {email} = req.body;

    if(!email){
        return res.json({success:false, message:"Email is required"})
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message: 'Look like a new user'});
        }

        // 
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 215 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "welcome to Girikalan magic show reset your password using otp",
            text: `You can reset your password, Here is your otp: ${otp}. use this otp to proceed with resetting your password.`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success:true, message:"OTP sent to your registered mail"})
        // 

    }catch(error){
        return res.json({success: false, message: error.message});
    }

} 

// Reset user password
export const resetPassword = async(req,res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "Email, Otp, and new password are required"})
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found' });
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: "Invalid Otp"});
        }

        if(user.resetOtpExpireAt < Date.now() ){
            return res.json({success: false, message: 'This otp was expired'});
        }

        const hashedPassword =  await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = ''
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success:true, message: 'Password has been successfully'});
        
    }catch(error){

    }
}


