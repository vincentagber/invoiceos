'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    Landmark,
    Calendar,
    FileText,
    AlertCircle,
    CheckCircle,
    Download,
    Info,
    UploadCloud
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RemittanceTracker } from '@/app/dashboard/components/RemittanceTracker';

export default function TaxesPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (token) {
            // Ensure your backend calculates based on the Nigerian 3-tier system
            api.get('/accounting/summary.php')
                .then(res => setSummary(res.data.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    const handleExport = () => {
        if (!summary) return;
        const taxData = summary?.tax_projection || { estimated_tax_owed: 0, tax_rate: 0 };
        const currentYear = new Date().getFullYear();

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "FIRS TAX FILING DATA (NIGERIA)\n";
        csvContent += `Assessment Year,${currentYear}\n`;
        csvContent += `Estimated CIT Liability,₦${taxData.estimated_tax_owed || 0}\n`;
        csvContent += `Applicable CIT Rate,${taxData.tax_rate}%\n`;
        csvContent += `Development Levy (4%),₦${taxData.dev_levy_amount || 0}\n`;
        csvContent += `Filing Deadline,June 30 ${currentYear + 1}\n`;
        csvContent += `Turnover (Gross Revenue),₦${summary.gross_revenue}\n`;
        csvContent += `Assessable Profit,₦${summary.net_profit}\n`;

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `firs_tax_package_${currentYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        setUploading(true);
        try {
            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Nigerian Tax Data...</div>;

    const taxData = summary?.tax_projection || { estimated_tax_owed: 0, tax_rate: 0, turnover: 0 };
    const currentYear = new Date().getFullYear();

    // Nigerian CIT Filing: 6 months after the end of the company's financial year
    // Assuming Dec 31st year-end, the deadline is June 30th.
    const filingDeadline = `June 30, ${currentYear + 1}`;

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tax Compliance (FIRS)</h1>
                    <p className="text-gray-500">Estimates based on Nigeria Tax Act 2025 & Finance Acts.</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase">
                        Currency: Nigerian Naira (₦)
                    </span>
                </div>
            </div>

            {/* Tax Overview Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <Landmark size={200} />
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <p className="text-emerald-200 font-medium mb-2 uppercase tracking-wide text-xs">Estimated CIT Liability ({currentYear})</p>
                        <h2 className="text-5xl font-bold mb-4">
                            ₦{taxData.estimated_tax_owed?.toLocaleString()}
                        </h2>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-emerald-100">
                                <span className="bg-white/20 px-2 py-0.5 rounded font-semibold">{taxData.tax_rate}% CIT Rate</span>
                                <span>+ {taxData.dev_levy_rate || '4'}% Development Levy*</span>
                            </div>
                            <p className="text-xs text-emerald-300 mt-2 italic">
                                *Small companies (Turnover &lt; ₦100M) may be exempt from CIT.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="text-emerald-300" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-emerald-50">CIT Filing Deadline</p>
                                <p className="text-emerald-200 text-sm">{filingDeadline} (6 months post-FYE)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="text-emerald-300" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-emerald-50">Filing Platform</p>
                                <p className="text-emerald-200 text-sm">TaxPro-Max (FIRS Portal)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remittance Tracker */}
            <RemittanceTracker />

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nigerian Compliance Checklist */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-emerald-600" />
                        Monthly & Annual Compliance
                    </h3>
                    <div className="space-y-3">
                        {[
                            'VAT Remittance (by 21st of every month)',
                            'WHT Returns (by 21st of every month)',
                            'PAYE Remittance (by 10th of every month)',
                            'Annual Returns (CAC filing)',
                            'Industrial Training Fund (ITF) - 1%',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-emerald-100">
                                <div className="h-5 w-5 rounded border border-gray-300 group-hover:border-emerald-500 transition-colors"></div>
                                <span className="text-gray-600 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Audit & Export</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Export your Trial Balance, P&L, and WHT credit notes for your Auditor or the FIRS TaxPro-Max upload.
                        </p>
                        <button
                            onClick={handleExport}
                            className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Download FIRS Data Package
                        </button>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Upload Filing Documents</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Store filed VAT/WHT evidence, receipts, or contracts (PDF, Excel, Word).
                        </p>
                        <div className="flex gap-2">
                            <label className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${uploading ? 'bg-gray-100' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
                                <UploadCloud size={18} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{uploading ? 'Uploading...' : 'Upload File'}</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(e, 'tax_filing')}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Policy Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-amber-900">
                    <h4 className="font-bold mb-1">2026 Policy Note: Development Levy</h4>
                    <p>
                        The <strong>4% Development Levy</strong> (replacing the Education Tax) applies to companies other than small companies. Ensure your "Assessable Profit" calculation includes this new unified rate.
                    </p>
                </div>
            </div>
        </div>
    );
}
