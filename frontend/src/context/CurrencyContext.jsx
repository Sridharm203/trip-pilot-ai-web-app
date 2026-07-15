import React, { createContext, useState, useEffect, useContext } from 'react';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const convertAmount = (usdValue) => {
    const val = parseFloat(usdValue) || 0;
    return currency === 'INR' ? val * 83 : val;
  };

  const formatAmount = (usdValue, decimals = 0) => {
    const val = parseFloat(usdValue) || 0;
    const isNegative = val < 0;
    const converted = convertAmount(Math.abs(val));
    const formatted = converted.toLocaleString(
      currency === 'INR' ? 'en-IN' : 'en-US',
      {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }
    );
    return `${isNegative ? '-' : ''}${currencySymbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, setCurrency, convertAmount, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
