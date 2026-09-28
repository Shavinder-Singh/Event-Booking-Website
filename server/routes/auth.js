const express=require('express');
const router=express.Router();
const {registerUser,loginUser,verifyOtp}=require('../controllers/authController');

router.post('/register',register);
router.post('/login',login);
router.post('/verify-otp',verifyOtp);
module.exports=router;