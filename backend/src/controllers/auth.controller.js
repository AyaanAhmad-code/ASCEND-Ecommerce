import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/config.js";
import sendEmail from "../utils/sendEmail.js";

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

    res.redirect("/");
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

// @desc    Forgot password
// @route   POST /api/auth/password/forgot
export const forgotPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      // Don't leak whether the email exists or not for security, just return success
      return res.status(200).json({ success: true, message: "If the email exists, a reset link was sent." });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: "This account uses Google Login. Please sign in with Google." });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url dynamically based on request host
    const reqHost = req.get("host");
    const protocol = reqHost.includes("localhost") ? "http" : "https";
    const clientHost = reqHost.includes("localhost") ? "localhost:5173" : reqHost;
    const resetUrl = `${protocol}://${clientHost}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #1a1410;">ASCEND Password Reset</h2>
        <p>You requested a password reset. Please make a PUT request or click the link below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #C9A96E; color: #1a1410; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p style="color: #777; font-size: 12px; margin-top: 40px;">This link will expire in 15 minutes.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        html: message,
      });

      res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/password/reset/:token
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token from URL params
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (!req.body.password) {
       return res.status(400).json({ message: "Please provide a new password" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendTokenResponse(user, res, "Password reset successfully");

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};