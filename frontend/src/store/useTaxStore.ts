import { create } from 'zustand';
import { addMonths, format, isAfter, setDate, differenceInDays } from 'date-fns';

export interface RemittanceRecord {
    month: string; // e.g., "2026-01"
    vatDue: number;
    whtDue: number;
    isFiled: boolean;
    isPaid: boolean;
}

export interface VATTransaction {
    id: string;
    type: 'output' | 'input_goods' | 'input_services' | 'input_assets';
    amount: number;
    description: string;
    date: string;
}

interface TaxState {
    // Financial Inputs
    turnover: number;
    assessableProfit: number;
    monthlyRecords: RemittanceRecord[];
    vatTransactions: VATTransaction[];

    // Actions
    addMonthlyRecord: (record: Omit<RemittanceRecord, 'isFiled' | 'isPaid'>) => void;
    markAsFiled: (month: string) => void;
    getDeadlineStatus: (month: string) => {
        deadline: Date;
        daysRemaining: number;
        isOverdue: boolean;
        potentialPenalty: number;
    };

    addVATTransaction: (t: VATTransaction) => void;
    calculateMonthlyVAT: () => {
        totalOutput: number;
        totalInput: number; // Includes services & assets (2026 rule)
        netPayable: number;
        isRefundEligible: boolean;
    };
}

export const useTaxStore = create<TaxState>((set, get) => ({
    turnover: 0,
    assessableProfit: 0,
    monthlyRecords: [
        // Seed some data for 2026
        { month: '2026-01', vatDue: 150000, whtDue: 25000, isFiled: true, isPaid: true },
        { month: '2026-02', vatDue: 180000, whtDue: 30000, isFiled: false, isPaid: false },
    ],
    vatTransactions: [],

    addMonthlyRecord: (record) => set((state) => ({
        monthlyRecords: [...state.monthlyRecords, { ...record, isFiled: false, isPaid: false }]
    })),

    markAsFiled: (month) => set((state) => ({
        monthlyRecords: state.monthlyRecords.map(r =>
            r.month === month ? { ...r, isFiled: true } : r
        )
    })),

    getDeadlineStatus: (monthStr) => {
        // Logic: Due by 21st of the following month
        const [year, month] = monthStr.split('-').map(Number);
        const transactionDate = new Date(year, month - 1, 1);
        const deadline = setDate(addMonths(transactionDate, 1), 21);

        const now = new Date(); // In a real app, use server time or reliable source
        // Ensuring we don't count today as overdue if it's strictly the same day, usually deadline is inclusive.
        // date-fns isAfter returns true if date is after
        const isOverdue = isAfter(now, deadline);
        const daysRemaining = differenceInDays(deadline, now);

        // 2026 Penalties: ₦100,000 for first month of default + ₦50,000 subsequent
        let potentialPenalty = 0;
        if (isOverdue && !get().monthlyRecords.find(r => r.month === monthStr)?.isFiled) {
            potentialPenalty = 100000;
            // Simplified logic: Real logic would check how many months overdue
        }

        return { deadline, daysRemaining, isOverdue, potentialPenalty };
    },

    addVATTransaction: (t) => set((state) => ({
        vatTransactions: [...state.vatTransactions, t]
    })),

    calculateMonthlyVAT: () => {
        const { vatTransactions } = get();

        // Output VAT (Tax you charged customers)
        const totalOutput = vatTransactions
            .filter(t => t.type === 'output')
            .reduce((sum, t) => sum + (t.amount * 0.075), 0);

        // Input VAT (Tax you paid to suppliers - now including services/assets)
        const totalInput = vatTransactions
            .filter(t => t.type.startsWith('input'))
            .reduce((sum, t) => sum + (t.amount * 0.075), 0);

        const netPayable = totalOutput - totalInput;

        return {
            totalOutput,
            totalInput,
            netPayable: netPayable > 0 ? netPayable : 0,
            isRefundEligible: netPayable < 0 // 2026 rules allow carry-forward or refund
        };
    }
}));
