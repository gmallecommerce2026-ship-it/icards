import React, { createContext, useState, useEffect, useContext } from 'react';
import adminApi from '../services/adminApi';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await adminApi.get('/public/settings');
                setSettings(response.data.data);
            } catch (error) {
                console.error("Không thể tải cài đặt giao diện:", error);
                // Có thể set một giá trị mặc định ở đây
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    return useContext(SettingsContext);
};