// Filename: useMessageTo.ts
import { useState, useEffect } from 'react';

/**
 * A custom hook for retrieving the 'messageTo' URL parameter value.
 * It returns the value of 'messageTo' and a function to check if it's set.
 */
export const useMessageTo = (): [string | null, () => boolean] => {
    // State to store the value of 'messageTo'
    const [messageTo, setMessageTo] = useState<string | null>(null);

    useEffect(() => {
        // Create a new URLSearchParams object from the lowercase version of the search string
        // This approach converts the entire query string to lowercase, including parameter names and values
        const queryStringLower = window.location.search.toLowerCase();
        const searchParams = new URLSearchParams(queryStringLower);
        // Attempt to get the 'messageto' parameter (now case-insensitive)
        const paramValue = searchParams.get('messageto'); // Parameter name in lowercase
        // Set the 'messageTo' state with the parameter value (could be null if not present)
        setMessageTo(paramValue);
    }, []); // Empty dependency array means this effect runs once on mount

    // Function to check if 'messageTo' is set (not null and not an empty string)
    const isMessageToSet = (): boolean => {
        return messageTo !== null && messageTo.trim() !== '';
    };

    // Return the 'messageTo' value and the 'isMessageToSet' function
    return [messageTo, isMessageToSet];
};
