import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: config.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
            address: user.address || null
        }
    })

}

export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        })

        await sendTokenResponse(user, res, "User registered successfully")

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" });
    }
}

export const login = async (req,res) => {

  const { email, password } = req.body;

  try {
    
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    await sendTokenResponse(user, res, "User logged in successfully");

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
}

export const getMe = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            message: "User fetched successfully",
            success: true,
            user: {
                id: user._id,
                email: user.email,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role,
                address: user.address || null
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const updateAddress = async (req, res) => {
    try {
        const {
            fullName,
            email,
            contact,
            line1,
            line2,
            city,
            state,
            postalCode,
            country,
        } = req.body;

        if (!fullName || !line1 || !city || !state || !postalCode || !country) {
            return res.status(400).json({
                message: "Please provide all required address fields",
                success: false,
            });
        }

        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            {
                contact,
                address: {
                    fullName,
                    email,
                    contact,
                    line1,
                    line2,
                    city,
                    state,
                    postalCode,
                    country,
                },
            },
            { new: true },
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Address updated successfully",
            success: true,
            user: {
                id: user._id,
                email: user.email,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role,
                address: user.address || null,
            },
        });
    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const googleAuthCallback = async (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;

    const email = emails[0].value;

    const profilePicture = photos[0].value;

    let user = await userModel.findOne({
      email
    })

    if (!user) {
      user = await userModel.create({
        email,
        googleId: id,
        fullname: displayName,
      })
    }

    const token = jwt.sign({
      id: user._id,
    }, config.JWT_SECRET, {
      expiresIn: "7d"
    })

    res.cookie("token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    const redirectUrl = config.NODE_ENV === "development" ? "http://localhost:5173/" : "/";
    res.redirect(redirectUrl);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
}