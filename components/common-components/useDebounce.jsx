"use client"
import { useEffect, useState } from 'react';

const useDebounce = (value, delay=1000) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
            // setDebouncedValue(value?.toLowerCase() || ""); 
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
