"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../lib/prisma"));
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase(),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])/, 'Password must contain a lowercase letter')
        .regex(/^(?=.*[A-Z])/, 'Password must contain an uppercase letter')
        .regex(/^(?=.*\d)/, 'Password must contain a number'),
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').toLowerCase(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const register = async (req, res, next) => {
    try {
        const validated = RegisterSchema.parse(req.body);
        const { email, password, name } = validated;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                businesses: {
                    create: {
                        name: `${name}'s Business`,
                    }
                }
            },
            include: {
                businesses: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '24h', issuer: 'invoiceos', audience: 'invoiceos-client' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, type: 'refresh' }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({ user, token });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
        }
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const validated = LoginSchema.parse(req.body);
        const { email, password } = validated;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { businesses: true }
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '24h', issuer: 'invoiceos', audience: 'invoiceos-client' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, type: 'refresh' }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ user, token });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
        }
        next(error);
    }
};
exports.login = login;
const me = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { businesses: true }
        });
        res.json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
