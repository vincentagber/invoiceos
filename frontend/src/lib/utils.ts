export const formatCurrency = (amount: number | string, currency: string = 'NGN') => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Default to NGN as per platform requirements
    const currencyCode = currency || 'NGN';
    
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2
    }).format(isNaN(value) ? 0 : value);
};

export const cn = (...classes: any[]) => {
    return classes.filter(Boolean).join(' ');
};
