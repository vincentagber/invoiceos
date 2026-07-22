export const formatCurrency = (amount: number | string, currency: string = 'NGN') => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Map currency to appropriate locale for formatting
    const locales: { [key: string]: string } = {
        'NGN': 'en-NG',
        'USD': 'en-US',
        'EUR': 'en-IE',
        'GBP': 'en-GB'
    };

    const locale = locales[currency] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(isNaN(value) ? 0 : value);
};

export const cn = (...classes: any[]) => {
    return classes.filter(Boolean).join(' ');
};

