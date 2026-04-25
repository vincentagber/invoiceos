"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.trackView = exports.updateStatus = exports.update = exports.getOne = exports.create = exports.getAll = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAll = async (req, res, next) => {
    try {
        const businessId = req.query.businessId;
        const invoices = await prisma_1.default.invoice.findMany({
            where: { businessId },
            include: { client: true, items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const create = async (req, res, next) => {
    try {
        const { businessId, clientId, items, ...data } = req.body;
        const invoice = await prisma_1.default.invoice.create({
            data: {
                ...data,
                businessId,
                clientId,
                items: {
                    create: items
                }
            },
            include: { client: true, items: true }
        });
        // Notify clients via Socket.io
        const io = req.app.get('io');
        io.to(businessId).emit('invoice-created', invoice);
        res.status(201).json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const getOne = async (req, res, next) => {
    try {
        const invoice = await prisma_1.default.invoice.findUnique({
            where: { id: req.params.id },
            include: { client: true, items: true, payments: true }
        });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.getOne = getOne;
const update = async (req, res, next) => {
    try {
        const { items, ...data } = req.body;
        // Delete existing items and recreate (simpler for updates)
        await prisma_1.default.invoiceItem.deleteMany({ where: { invoiceId: req.params.id } });
        const invoice = await prisma_1.default.invoice.update({
            where: { id: req.params.id },
            data: {
                ...data,
                items: {
                    create: items
                }
            },
            include: { client: true, items: true }
        });
        res.json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const invoice = await prisma_1.default.invoice.update({
            where: { id: req.params.id },
            data: { status },
            include: { business: true }
        });
        const io = req.app.get('io');
        io.to(invoice.businessId).emit('invoice-status-updated', { id: invoice.id, status });
        res.json(invoice);
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
const trackView = async (req, res, next) => {
    try {
        const invoice = await prisma_1.default.invoice.update({
            where: { id: req.params.id },
            data: {
                viewCount: { increment: 1 },
                lastViewedAt: new Date(),
                status: {
                    set: 'VIEWED' // Automatically move to VIEWED status if currently SENT
                }
            }
        });
        const io = req.app.get('io');
        io.to(invoice.businessId).emit('invoice-viewed', { id: invoice.id, viewCount: invoice.viewCount });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
exports.trackView = trackView;
const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if invoice exists and belongs to the business
        const invoice = await prisma_1.default.invoice.findUnique({
            where: { id: id }
        });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        // Delete items first due to foreign key constraints if not using cascade
        await prisma_1.default.invoiceItem.deleteMany({ where: { invoiceId: id } });
        await prisma_1.default.payment.deleteMany({ where: { invoiceId: id } });
        await prisma_1.default.invoice.delete({
            where: { id: id }
        });
        res.json({ success: true, message: 'Invoice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
