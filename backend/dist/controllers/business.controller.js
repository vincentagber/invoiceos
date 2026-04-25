"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranding = exports.update = exports.getOne = exports.getCurrent = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getCurrent = async (req, res, next) => {
    try {
        const business = await prisma_1.default.business.findFirst({
            where: { ownerId: req.user?.id },
            include: { _count: { select: { clients: true, invoices: true } } }
        });
        res.json(business);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrent = getCurrent;
const getOne = async (req, res, next) => {
    try {
        const business = await prisma_1.default.business.findUnique({
            where: { id: req.params.id },
            include: { _count: { select: { clients: true, invoices: true } } }
        });
        res.json(business);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const business = await prisma_1.default.business.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(business);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const updateBranding = async (req, res, next) => {
    try {
        const { logo, brandColor, customDomain } = req.body;
        const business = await prisma_1.default.business.update({
            where: { id: req.params.id },
            data: { logo, brandColor, customDomain }
        });
        res.json(business);
    }
    catch (error) {
        next(error);
    }
};
exports.updateBranding = updateBranding;
