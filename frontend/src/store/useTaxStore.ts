import { create } from 'zustand';
import { addMonths, setDate, differenceInDays, isAfter } from 'date-fns';
import api from '@/lib/api';

export interface RemittanceRecord {
    month: string;
    vatDue: number;
    whtDue: number;
    revenue: number;
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
    turnover: number;
    assessableProfit: number;
    monthlyRecords: RemittanceRecord[];
    vatTransactions: VATTransaction[];
    loading: boolean;
    error: string | null;
    fetchMonthlyRecords: (businessId: string) => Promise<void>;
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
        totalInput: number;
        netPayable: number;
        isRefundEligible: boolean;
    };
}

export const useTaxStore = create<TaxState>((set, get) => ({
    turnover: 0,
    assessableProfit: 0,
    monthlyRecords: [],
    vatTransactions: [],
    loading: false,
    error: null,

    fetchMonthlyRecords: async (businessId: string) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/accounting/monthly-remittance?businessId=${businessId}`);
            const records: RemittanceRecord[] = (res.data.data || []).map((r: any) => ({
                ...r,
                isFiled: false,
                isPaid: false,
            }));
            set({ monthlyRecords: records, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to load remittance data', loading: false });
        }
    },

    markAsFiled: (month) => set((state) => ({
        monthlyRecords: state.monthlyRecords.map(r =>
            r.month === month ? { ...r, isFiled: true } : r
        )
    })),

    getDeadlineStatus: (monthStr) => {
        const [year, month] = monthStr.split('-').map(Number);
        const transactionDate = new Date(year, month - 1, 1);
        const deadline = setDate(addMonths(transactionDate, 1), 21);
        const now = new Date();
        const isOverdue = isAfter(now, deadline);
        const daysRemaining = differenceInDays(deadline, now);
        let potentialPenalty = 0;
        if (isOverdue && !get().monthlyRecords.find(r => r.month === monthStr)?.isFiled) {
            potentialPenalty = 100000;
        }
        return { deadline, daysRemaining, isOverdue, potentialPenalty };
    },

    addVATTransaction: (t) => set((state) => ({
        vatTransactions: [...state.vatTransactions, t]
    })),

    calculateMonthlyVAT: () => {
        const { vatTransactions } = get();
        const totalOutput = vatTransactions
            .filter(t => t.type === 'output')
            .reduce((sum, t) => sum + (t.amount * 0.075), 0);
        const totalInput = vatTransactions
            .filter(t => t.type.startsWith('input'))
            .reduce((sum, t) => sum + (t.amount * 0.075), 0);
        const netPayable = totalOutput - totalInput;
        return {
            totalOutput,
            totalInput,
            netPayable: netPayable > 0 ? netPayable : 0,
            isRefundEligible: netPayable < 0
        };
    }
}));
