import { Request, Response } from "express";
import { Transaction } from "sequelize";
import sequelize from "../config/database";
import Admin from "../models/Admin";
import User from "../models/User";
import { hashAdminPassword, compareAdminPassword, generateAdminToken } from "../services/adminAuthService";
import { hashPassword } from "../services/authService";
import { serializeAdmin } from "../serializers/adminSerializer";
import { serializeUser } from "../serializers/userSerializer";
import { createUserScheme } from "../services/userSchemeService";
import { sendWelcomeEmail } from "../services/emailService";
import { generateUniqueUserId } from "../utils/idGenerator";
import UserScheme from "../models/UserScheme";
import Settings from "../models/Settings";
import Scheme from "../models/Scheme";
import { createTransaction } from "../services/transactionService";

// Register a new admin
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const hashedPassword = await hashAdminPassword(password);
    const admin = await Admin.create({ name, email, password: hashedPassword });
    const serializedAdmin = serializeAdmin(admin);

    res.status(201).json({ message: "Admin registered successfully!", admin: serializedAdmin });
  } catch (error: any) {
    console.error("Admin Registration Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }
    
    res.status(500).json({ error: "Failed to register admin" });
  }
};

// Login admin and return JWT token
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await compareAdminPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateAdminToken(admin.id);
    const serializedAdmin = serializeAdmin(admin);

    res.json({ 
      message: "Login successful", 
      token,
      admin: serializedAdmin
    });
  } catch (error: any) {
    console.error("Admin Login Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });
    res.status(500).json({ error: "Failed to login" });
  }
};

// Register a new user (admin only)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      password, 
      nominee, 
      relation, 
      mobile, 
      current_address, 
      permanent_address, 
      dob, 
      schemeId, 
      receive_posts,
      profile_image,
      id_proof,
      referred_by,
      desired_item,
      payment_mode,
      payment_details,
      supporting_document_url,
      amount,
      payment_date
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !nominee || !relation || !mobile || !current_address || !permanent_address || !dob) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          name: !name ? "Name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          password: !password ? "Password is required" : undefined,
          nominee: !nominee ? "Nominee is required" : undefined,
          relation: !relation ? "Relation is required" : undefined,
          mobile: !mobile ? "Mobile number is required" : undefined,
          current_address: !current_address ? "Current address is required" : undefined,
          permanent_address: !permanent_address ? "Permanent address is required" : undefined,
          dob: !dob ? "Date of birth is required" : undefined
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    // Parse the date to YYYY-MM-DD format for DATEONLY type
    const parsedDob = new Date(dob).toISOString().split('T')[0];
    if (isNaN(new Date(parsedDob).getTime())) {
      return res.status(400).json({ error: "Invalid date format. Please provide date in YYYY-MM-DD format" });
    }

    // Check if the referred_by user exists if provided
    let referrerId = null;
    if (referred_by) {
      const referrerUser = await User.findOne({ where: { userId: referred_by } });
      if (!referrerUser) {
        return res.status(400).json({ 
          error: "Invalid referrer",
          details: "The referred_by user does not exist"
        });
      }
      // Store the actual UUID of the referrer to match database schema
      referrerId = referrerUser.id;
    }

    // Generate a unique userId in the format HS-XXXXXX
    const uniqueUserId = await generateUniqueUserId(User);

    // Start a transaction to ensure both user and scheme mapping are created
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Create user
      const user = await User.create({ 
        name, 
        email, 
        password: hashedPassword, 
        nominee, 
        relation, 
        current_address, 
        permanent_address, 
        mobile, 
        dob: parsedDob,
        receive_posts: receive_posts || false,
        profile_image: profile_image || null,
        id_proof: id_proof || null,
        userId: uniqueUserId,
        referred_by: referrerId
      }, { transaction: t });

      // Create user-scheme mapping and initial deposit only if schemeId is provided
      let userScheme = null;
      let initialDeposit = null;
      let bonusPoints = 0;
      let paymentDetails = null;
      
      if (schemeId) {
        try {
          const schemeResult = await createUserScheme(user.id, schemeId, t, desired_item, payment_mode && payment_details && amount && payment_date ? {
            payment_mode,
            payment_details,
            supporting_document_url: supporting_document_url || null,
            amount: parseFloat(amount),
            payment_date: new Date(payment_date)
          } : undefined);
          userScheme = schemeResult.userScheme;
          initialDeposit = schemeResult.initialDeposit;
          bonusPoints = schemeResult.bonusPoints || 0;
          paymentDetails = schemeResult.paymentDetails;
        } catch (schemeError) {
          console.error("Error creating user scheme:", schemeError);
          // Continue with user creation even if scheme mapping fails
        }
      }

      if(referrerId){
        let refbonusPoints = 0;
        const referrer = await UserScheme.findOne({where: {userId: referrerId}});
        if(referrer){
          const referralBonus = await Settings.findOne({
            where: { 
              key: 'referral_bonus',
              is_deleted: false
            },
            transaction: t
          });
          const scheme = await Scheme.findByPk(schemeId, {transaction: t});
          if(referralBonus && scheme){
            const referralBonusAmount = parseFloat(referralBonus.value);
            const referralBonusPoints = referralBonusAmount * scheme.goldGrams;
            refbonusPoints = referralBonusPoints;
          }

          //get referrers user scheme
          const referrerUserScheme = await UserScheme.findOne({where: {userId: referrerId, status: "ACTIVE"}});
          if(referrerUserScheme){
            referrerUserScheme.availablePoints += refbonusPoints;
            referrerUserScheme.totalPoints += refbonusPoints;
            await referrerUserScheme.save();


            const bonusTransaction = await createTransaction({
              userSchemeId: referrerUserScheme.id,
              transactionType: "points",
              amount: 0, // No amount for bonus points
              goldGrams: 0, // No gold grams for bonus points
              points: refbonusPoints,
              description: `Referral bonus points ${refbonusPoints} awarded for joining ${name}.`,
              transaction: t
            }).catch(err => {
              throw new Error(`Failed to create bonus points transaction: ${err.message}`);
            });
          }
          
        }

      }

      return { user, userScheme, initialDeposit, bonusPoints, paymentDetails };
    });

    const serializedUser = serializeUser(result.user);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name, password);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      message: schemeId 
        ? (result.bonusPoints && result.bonusPoints > 0 
            ? `User registered successfully with ${result.bonusPoints} bonus points!`
            : "User registered successfully with scheme!")
        : "User registered successfully!",
      user: serializedUser,
      scheme: result.userScheme || null,
      initialDeposit: result.initialDeposit || null,
      bonusPoints: result.bonusPoints || 0,
      paymentDetails: result.paymentDetails || null
    });
  } catch (error: any) {
    console.error("User Registration Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }
    
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Rename the function to createAdminUserScheme
export const createAdminUserScheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      userId, 
      schemeId, 
      startDate,
      endDate,
      initialPoints,
      status,
      desired_item,
      payment_details
    } = req.body;
    
    // Validate required fields
    if (!userId || !schemeId) {
      res.status(400).json({ 
        success: false,
        message: "Failed to create user scheme",
        error: "User ID and Scheme ID are required"
      });
      return;
    }

    // Start a transaction to ensure data consistency
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Create user scheme with the imported service function
      const schemeResult = await createUserScheme(
        userId, 
        schemeId, 
        t, 
        desired_item,
        payment_details ? {
          payment_mode: payment_details.payment_mode,
          payment_details: payment_details.payment_details,
          supporting_document_url: payment_details.supporting_document_url || undefined,
          amount: parseFloat(payment_details.amount),
          payment_date: new Date(payment_details.payment_date)
        } : undefined,
        {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          initialPoints: initialPoints || undefined,
          status: status || undefined,
          // Initial deposit will be calculated automatically from scheme details
        }
      );

      return {
        userScheme: schemeResult.userScheme,
        initialDeposit: schemeResult.initialDeposit,
        paymentDetails: schemeResult.paymentDetails,
        bonusPoints: schemeResult.bonusPoints
      };
    });

    res.status(201).json({
      success: true,
      message: result.bonusPoints && result.bonusPoints > 0 
        ? `User scheme created successfully with ${result.bonusPoints} bonus points` 
        : "User scheme created successfully",
      data: {
        userScheme: result.userScheme,
        initialDeposit: result.initialDeposit,
        paymentDetails: result.paymentDetails
      }
    });
  } catch (error: any) {
    console.error("User Scheme Creation Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({ 
        success: false,
        message: "Failed to create user scheme",
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
      return;
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to create user scheme",
      error: error.message
    });
  }
};
