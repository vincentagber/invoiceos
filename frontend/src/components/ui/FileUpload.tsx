'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadProps {
    label?: string;
    accept?: string;
    maxSizeMB?: number; // default 2MB
    value?: string | null; // URL or Base64
    onChange: (file: File | null, base64: string | null) => void;
    className?: string;
}

export function FileUpload({ label, accept = "image/*", maxSizeMB = 2, value, onChange, className }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = useCallback((file: File) => {
        setError(null);
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLoading(false);
            onChange(file, reader.result as string);
        };
        reader.onerror = () => {
            setLoading(false);
            setError("Failed to read file");
        };
        reader.readAsDataURL(file);

    }, [maxSizeMB, onChange]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files[0]);
        }
    }, [handleFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering upload
        e.preventDefault();
        onChange(null, null);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div
                className={clsx(
                    "relative group flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden bg-gray-50",
                    dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-100",
                    error ? "border-red-300 bg-red-50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
            >
                <input
                    id={`file-upload-${label}`}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {loading ? (
                    <div className="flex flex-col items-center text-gray-400">
                        <Loader2 className="animate-spin mb-2" size={24} />
                        <span className="text-sm">Processing...</span>
                    </div>
                ) : value ? (
                    <>
                        <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={handleRemove}
                                className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 hover:text-red-500 shadow-sm transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                            <Upload size={20} />
                        </div>
                        <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max {maxSizeMB}MB)</p>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600 animate-in slide-in-from-top-1 fade-in">{error}</p>}
        </div>
    );
}
