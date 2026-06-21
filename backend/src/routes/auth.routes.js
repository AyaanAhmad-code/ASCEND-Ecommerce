import { Router } from "express";
import { validateLoginUser, validateRegisterUser } from "../validators/auth.validator.js";
import { login, register, googleAuthCallback, getMe, updateAddress } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import passport from "passport";
import { config } from "../config/config.js";

const authRouter = Router()

authRouter.post("/register", validateRegisterUser, register)
authRouter.post("/login", validateLoginUser, login)
authRouter.get("/me", authenticateUser, getMe)
authRouter.put("/address", authenticateUser, updateAddress)
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: config.NODE_ENV === "development" ? "http://localhost:5173/login" : "/login" }), googleAuthCallback) 

export default authRouter