"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenueTrends = exports.getSummary = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const getSummary = async (req, res, next) => {
    try {
        const businessId = req.query.businessId;
        if (!businessId) {
            return res.status(400).json({ message: 'Business ID is required for analytics' });
        }
        const [totalInvoiced, paidAmount, outstandingAmount] = await Promise.all([
            prisma_1.default.invoice.aggregate({
                where: { businessId },
                _sum: { totalAmount: true }
            }),
            prisma_1.default.invoice.aggregate({
                where: { businessId, status: client_1.InvoiceStatus.PAID },
                _sum: { totalAmount: true }
            }),
            prisma_1.default.invoice.aggregate({
                where: { businessId, status: { notIn: [client_1.InvoiceStatus.PAID, client_1.InvoiceStatus.CANCELLED] } },
                _sum: { totalAmount: true }
            })
        ]);
        const sentInvoices = await prisma_1.default.invoice.count({ where: { businessId, status: { not: 'DRAFT' } } });
        const paidInvoices = await prisma_1.default.invoice.count({ where: { businessId, status: 'PAID' } });
        res.json({
            metrics: {
                totalInvoiced: totalInvoiced._sum.totalAmount || 0,
                paidAmount: paidAmount._sum.totalAmount || 0,
                outstandingAmount: outstandingAmount._sum.totalAmount || 0,
                conversionRate: sentInvoices > 0 ? (paidInvoices / sentInvoices) * 100 : 0
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSummary = getSummary;
const getRevenueTrends = async (req, res, next) => {
    try {
        const businessId = req.query.businessId;
        // Simple grouping by month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const invoices = await prisma_1.default.invoice.findMany({
            where: {
                businessId,
                issueDate: { gte: sixMonthsAgo },
                status: client_1.InvoiceStatus.PAID
            },
            select: {
                totalAmount: true,
                issueDate: true
            }
        });
        // Grouping logic
        const trends = invoices.reduce((acc, inv) => {
            const month = inv.issueDate.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + inv.totalAmount;
            return acc;
        }, {});
        res.json(trends);
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueTrends = getRevenueTrends;
