"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranding = exports.update = exports.getOne = exports.updateCurrent = exports.getCurrent = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const supabase_1 = require("../lib/supabase");
const getCurrent = async (req, res, next) => {
    try {
        // Temporary fallback to Supabase due to Prisma authentication failure
        const { data: business, error } = await supabase_1.supabase
            .from('organizations')
            .select('*, clients(count), invoices(count)')
            .eq('owner_id', req.user?.id)
            .maybeSingle();
        if (error)
            throw error;
        if (!business)
            return res.status(404).json({ error: 'Institutional workspace not found' });
        res.json(business);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrent = getCurrent;
const updateCurrent = async (req, res, next) => {
    try {
        const business = await prisma_1.default.business.findFirst({
            where: { ownerId: req.user?.id }
        });
        if (!business)
            return res.status(404).json({ error: 'Institutional workspace not found' });
        const updated = await prisma_1.default.business.update({
            where: { id: business.id },
            data: req.body
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCurrent = updateCurrent;
const getOne = async (req, res, next) => {
    try {
        const business = await prisma_1.default.business.findUnique({
            where: { id: req.params.id },
            include: {
                _count: {
                    select: { clients: true, invoices: true }
                }
            }
        });
        if (!business)
            return res.status(404).json({ error: 'Institutional entity not found' });
        res.json(business);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const updated = await prisma_1.default.business.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const updateBranding = async (req, res, next) => {
    try {
        const { logo, brandColor, customDomain } = req.body;
        const updated = await prisma_1.default.business.update({
            where: { id: req.params.id },
            data: {
                // Note: logo is handled differently in settings.controller if it's binary
                // but here we maintain backward compatibility if needed
                brandColor,
                customDomain
            }
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateBranding = updateBranding;
