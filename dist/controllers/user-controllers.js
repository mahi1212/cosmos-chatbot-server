"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePayment = exports.checkTier = exports.updateSettings = exports.getSettings = exports.verifyUser = exports.logoutUser = exports.userLogin = exports.userSignup = exports.getAllUser = void 0;
const Users_1 = __importDefault(require("../models/Users"));
const bcrypt_1 = require("bcrypt");
const token_manager_1 = require("../utils/token-manager");
const constants_1 = require("../utils/constants");
const Settings_1 = __importDefault(require("../models/Settings"));
const stripe = require('stripe')('sk_test_51Jwq46FHT166OGAM2bXs8VMYYteGXvXCmFSpwnkX6dDKUChwMHJKKo89bxVHsHBX8dSXHA8rFobHDOgJOJuenTVJ00bQbAtltP');
const getAllUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get all user
    try {
        const users = yield Users_1.default.find().select('-password');
        return res.status(200).json({
            message: "OK",
            users: users
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.getAllUser = getAllUser;
const userSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        // alrady exist checking
        const existingUser = yield Users_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exist",
            });
        }
        // create user, chats & settings
        const user = new Users_1.default({ name, email, password: hashedPassword });
        yield user.save();
        // console.log('User created with ID:', user._id);
        const settings = new Settings_1.default({ user_id: user._id });
        yield settings.save();
        // Check if settings were saved successfully
        console.log('Settings saved:', settings); // create token and store cookie
        // clear previous cookie
        res.clearCookie(constants_1.COOKIE_NAME, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            httpOnly: true,
            signed: true
        });
        const token = (0, token_manager_1.createToken)(user._id.toString(), user.email, "7d");
        //  set cookie
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(constants_1.COOKIE_NAME, token, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            expires,
            httpOnly: true,
            signed: true,
            secure: true, // Required for cookies to be sent over HTTPS
            sameSite: 'none' // Lowercase 'none' for cross-site cookies
        });
        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
            _id: user._id.toString()
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.userSignup = userSignup;
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingUser = yield Users_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({
                message: "User not found"
            });
        }
        // check is user pass correcy
        const isPasswordCorrect = yield (0, bcrypt_1.compare)(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }
        // clear previous cookie
        res.clearCookie(constants_1.COOKIE_NAME, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            httpOnly: true,
            signed: true
        });
        const token = yield (0, token_manager_1.createToken)(existingUser._id.toString(), existingUser.email, "7d");
        // console.log(token)
        //  set cookie
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        res.cookie(constants_1.COOKIE_NAME, token, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            expires,
            httpOnly: true,
            signed: true,
            secure: true, // Required for cookies to be sent over HTTPS
            sameSite: 'none' // Lowercase 'none' for cross-site cookies
        });
        return res.status(200).json({
            message: "OK",
            name: existingUser.name,
            email: existingUser.email,
            _id: existingUser._id.toString()
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.userLogin = userLogin;
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        // console.log(user);
        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            });
        }
        res.clearCookie(constants_1.COOKIE_NAME, {
            path: "/",
            domain: process.env.DOMAIN_NAME,
            httpOnly: true,
            signed: true
        });
        return res.status(200).json({
            message: "Successfully logged out"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.logoutUser = logoutUser;
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_1.default.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(400).json({
                message: "User not registered or TOKEN malfuncationed"
            });
        }
        console.log(user._id.toString(), res.locals.jwtData.id);
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied",
            });
        }
        return res.status(200).json({
            message: "OK",
            name: user.name,
            email: user.email,
            _id: user._id.toString()
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.verifyUser = verifyUser;
const getSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield Settings_1.default.findOne({ user_id: res.locals.jwtData.id });
        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            });
        }
        if (settings.user_id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            });
        }
        return res.status(200).json({
            message: "OK",
            settings: settings
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield Settings_1.default.findOne({ user_id: res.locals.jwtData.id });
        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            });
        }
        if (settings.user_id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            });
        }
        const { gpt_version, system_prompt, temperature, max_tokens, top_p, frequency_penalty, token_usage } = req.body.settings;
        if (gpt_version)
            settings.gpt_version = gpt_version;
        if (system_prompt)
            settings.system_prompt = system_prompt;
        if (temperature)
            settings.temperature = temperature;
        if (max_tokens)
            settings.max_tokens = max_tokens;
        if (top_p)
            settings.top_p = top_p;
        if (frequency_penalty)
            settings.frequency_penalty = frequency_penalty;
        if (token_usage)
            settings.token_usage = token_usage;
        yield settings.save();
        return res.status(200).json({
            message: "OK",
            settings: settings
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.updateSettings = updateSettings;
const checkTier = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield Settings_1.default.findOne({ user_id: res.locals.jwtData.id });
        // console.log(settings)
        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            });
        }
        if (settings.user_id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            });
        }
        if (settings.tier === 'premium') {
            return res.status(200).json({
                message: "OK",
                isPremium: true
            });
        }
        return res.status(200).json({
            message: "OK",
            isPremium: false
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.checkTier = checkTier;
const makePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield Settings_1.default.findOne({ user_id: res.locals.jwtData.id });
        if (!settings) {
            return res.status(400).json({
                message: "Settings not found"
            });
        }
        if (settings.user_id.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({
                message: "Permission denied"
            });
        }
        const { session_id } = req.body;
        const session = yield stripe.checkout.sessions.retrieve(session_id);
        // console.log(session)
        // await settings.save()
        // console.log(session_id)
        // save customer id, expiry date, tier
        settings.stripe_customer_id = session.customer;
        settings.tier = 'premium';
        // settings.expireAt = new Date(session.current_period_end * 1000)
        const unixTimestamp = session.created;
        // Number of seconds in 30 days (30 days * 24 hours * 60 minutes * 60 seconds)
        const secondsIn30Days = 30 * 24 * 60 * 60;
        // Add 30 days to the original timestamp
        const newTimestamp = unixTimestamp + secondsIn30Days;
        // console.log("Original Timestamp:", unixTimestamp);
        // console.log("Timestamp after adding 30 days:", newTimestamp);
        settings.expireAt = new Date(newTimestamp * 1000);
        yield settings.save();
        return res.status(200).json({
            message: "OK",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "ERROR",
            reason: error.message
        });
    }
});
exports.makePayment = makePayment;
