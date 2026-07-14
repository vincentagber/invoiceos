'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

interface ExcelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ count: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const reset = () => {
        setFile(null);
        setUploading(false);
        setResult(null);
        setError(null);
        setDragActive(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
            setFile(droppedFile);
            setError(null);
            setResult(null);
        } else {
            setError('Please upload a valid Excel file (.xlsx or .xls)');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const bizRes = await api.get('/business/me');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('businessId', bizRes.data.id);

            const res = await api.post('/expenses/upload-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setResult(res.data);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const inputBaseClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/5 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Import from Excel</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {result ? (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="p-4 rounded-full bg-emerald-50 text-emerald-600">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Import Complete</h3>
                            <p className="text-sm text-slate-500 text-center">
                                Successfully imported <strong className="text-slate-900">{result.count}</strong> expense{result.count !== 1 ? 's' : ''} from your Excel file.
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-4 px-6 py-2.5 rounded-xl bg-[#5E6AD2] text-white text-sm font-bold shadow-sm shadow-[#5E6AD2]/20 hover:bg-[#4E5AC2] transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div
                                className={clsx(
                                    "relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                                    dragActive
                                        ? "border-[#5E6AD2] bg-indigo-50"
                                        : "border-slate-200 hover:border-slate-300 bg-slate-50",
                                    error ? "border-red-300 bg-red-50" : ""
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileSelect}
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-white rounded-full shadow-sm">
                                            <FileSpreadsheet size={24} className="text-emerald-600" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                                            className="text-xs text-rose-500 font-medium hover:text-rose-600 mt-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                                        <p className="text-xs text-slate-400 mt-1">.xlsx or .xls (max 5MB)</p>
                                    </div>
                                )}
                            </div>
                            {error && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-red-700">{error}</p>
                                </div>
                            )}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Columns</p>
                                <p className="text-sm text-slate-600">
                                    Your Excel file should include columns like{' '}
                                    <span className="font-mono font-bold text-slate-800">Merchant</span>,{' '}
                                    <span className="font-mono font-bold text-slate-800">Amount</span>,{' '}
                                    <span className="font-mono font-bold text-slate-800">Currency</span>,{' '}
                                    <span className="font-mono font-bold text-slate-800">Category</span>,{' '}
                                    <span className="font-mono font-bold text-slate-800">Date</span>, and{' '}
                                    <span className="font-mono font-bold text-slate-800">Description</span>.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!result && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="px-6 py-2.5 rounded-xl bg-[#5E6AD2] text-white text-sm font-bold shadow-sm shadow-[#5E6AD2]/20 hover:bg-[#4E5AC2] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                'Import Expenses'
                            )}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
