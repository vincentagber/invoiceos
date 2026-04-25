"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = exports.create = exports.getAll = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAll = async (req, res, next) => {
    try {
        const businessId = req.query.businessId;
        const clients = await prisma_1.default.client.findMany({
            where: { businessId },
            include: { _count: { select: { invoices: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(clients);
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const create = async (req, res, next) => {
    try {
        const { businessId, ...data } = req.body;
        const client = await prisma_1.default.client.create({
            data: { ...data, businessId }
        });
        res.status(201).json(client);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getOne = async (req, res, next) => {
    try {
        const client = await prisma_1.default.client.findUnique({
            where: { id: req.params.id },
            include: { invoices: true }
        });
        res.json(client);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
