import { createContext, useContext, useState, type ReactNode } from 'react';
import type { City } from '../types';
interface CityContextValue {
    city: City | null;
    setCity: (city: City) => void;
    clearCity: () => void;
}
const CityContext = createContext<CityContextValue | null>(null);
const CITY_KEY = 'cinevista_city';
export function CityProvider({ children }: {
    children: ReactNode;
}) {
    const [city, setCityState] = useState<City | null>(() => {
        const saved = localStorage.getItem(CITY_KEY);
        if (saved === 'Multan' || saved === 'Lahore' || saved === 'Karachi')
            return saved;
        return null;
    });
    function setCity(c: City) {
        setCityState(c);
        localStorage.setItem(CITY_KEY, c);
    }
    function clearCity() {
        setCityState(null);
        localStorage.removeItem(CITY_KEY);
    }
    return <CityContext.Provider value={{ city, setCity, clearCity }}>{children}</CityContext.Provider>;
}
export function useCity() {
    const ctx = useContext(CityContext);
    if (!ctx)
        throw new Error('useCity must be used inside CityProvider');
    return ctx;
}
