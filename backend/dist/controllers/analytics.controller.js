"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenueTrends = exports.getSummary = void 0;
const supabase_1 = require("../lib/supabase");
const getSummary = async (req, res, next) => {
    try {
        const organizationId = req.query.businessId;
        if (!organizationId) {
            return res.status(400).json({ message: 'Organization ID is required' });
        }
        // 1. Fetch Invoices for aggregation
        const { data: invoices, error } = await supabase_1.supabase
            .from('invoices')
            .select('status, total_amount, client_id, clients(name)')
            .eq('organization_id', organizationId);
        if (error)
            throw error;
        const metrics = {
            totalInvoiced: 0,
            paidAmount: 0,
            outstandingAmount: 0,
            conversionRate: 0,
            invoicesSentCount: 0,
            totalClients: 0
        };
        const clientRevenue = {};
        let paidCount = 0;
        invoices?.forEach(inv => {
            metrics.totalInvoiced += inv.total_amount;
            // Client aggregation
            const clientId = inv.client_id;
            const clientName = inv.clients?.name || 'Unknown Client';
            if (!clientRevenue[clientId]) {
                clientRevenue[clientId] = { name: clientName, total: 0, balance: 0 };
            }
            clientRevenue[clientId].total += inv.total_amount;
            if (inv.status === 'PAID') {
                metrics.paidAmount += inv.total_amount;
                paidCount++;
            }
            else if (inv.status !== 'CANCELLED') {
                metrics.outstandingAmount += inv.total_amount;
                clientRevenue[clientId].balance += inv.total_amount;
            }
            if (inv.status !== 'DRAFT') {
                metrics.invoicesSentCount++;
            }
        });
        metrics.conversionRate = metrics.invoicesSentCount > 0 ? (paidCount / metrics.invoicesSentCount) * 100 : 0;
        // 2. Fetch Total Clients count
        const { count: clientCount } = await supabase_1.supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId);
        metrics.totalClients = clientCount || 0;
        // 3. Fetch Expenses for aggregation
        let totalExpenses = 0;
        try {
            const { data: expenses, error: expError } = await supabase_1.supabase
                .from('expenses')
                .select('amount')
                .eq('organization_id', organizationId);
            if (!expError) {
                totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
            }
        }
        catch (e) {
            console.error('Expenses table fetch failed', e);
        }
        // 4. Sort Top Clients
        const topClients = Object.entries(clientRevenue)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
        res.json({
            metrics: {
                ...metrics,
                totalExpenses
            },
            topClients
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSummary = getSummary;
const getRevenueTrends = async (req, res, next) => {
    try {
        const organizationId = req.query.businessId;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const { data: invoices, error } = await supabase_1.supabase
            .from('invoices')
            .select('total_amount, issue_date')
            .eq('organization_id', organizationId)
            .eq('status', 'PAID')
            .gte('issue_date', sixMonthsAgo.toISOString());
        if (error)
            throw error;
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push(d.toLocaleString('default', { month: 'short' }));
        }
        const trends = last6Months.map(month => ({
            name: month,
            revenue: 0,
            expenses: 0
        }));
        (invoices || []).forEach(inv => {
            const month = new Date(inv.issue_date).toLocaleString('default', { month: 'short' });
            const trend = trends.find(t => t.name === month);
            if (trend) {
                trend.revenue += inv.total_amount;
            }
        });
        // Fetch Expenses for trends (Resilient)
        try {
            const { data: expensesData, error: expError } = await supabase_1.supabase
                .from('expenses')
                .select('amount, date')
                .eq('organization_id', organizationId)
                .gte('date', sixMonthsAgo.toISOString());
            if (!expError && expensesData) {
                expensesData.forEach(exp => {
                    const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
                    const trend = trends.find(t => t.name === month);
                    if (trend) {
                        trend.expenses += exp.amount;
                    }
                });
            }
        }
        catch (e) {
            console.error('Expenses trends fetch failed', e);
        }
        res.json(trends);
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueTrends = getRevenueTrends;
