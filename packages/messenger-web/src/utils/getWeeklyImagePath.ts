/**
 * Generates a weekly-based pseudo-random image path using the current week of the year.
 * This ensures the image remains consistent throughout the week but changes weekly.
 * The function calculates the week number of the current year and uses it to generate
 * a pseudo-random index for selecting an image. The selection is consistent for the same
 * week across different executions but changes with the week number.
 *
 * @returns The path to the selected image, adjusting the path as needed based on the
 *          pseudo-random index and the available number of images.
 */
export const getWeeklyImagePath = (): string => {
    const now = new Date();
    // Set the start of the year.
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    // Calculate the difference in milliseconds between now and the start of the year.
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 86400000; // Milliseconds per day.
    // Calculate the day of the year.
    const dayOfYear = Math.floor(diff / oneDay);
    // Calculate the week of the year.
    const weekOfYear = Math.floor(dayOfYear / 7);

    /**
     * Generates a simple hash from a week number. This hash function converts
     * the week number to a string and calculates a hash value by iterating over
     * each character of the string. The hash is intended to be a pseudo-random
     * but consistent number derived from the week number.
     *
     * @param week The week number to hash.
     * @returns A positive integer hash value of the week number.
     */
    const simpleHash = (week: number): number => {
        let hash = 0;
        const str = week.toString();
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // Perform bitwise operations to calculate the hash.
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer by forcing overflow.
        }
        return Math.abs(hash);
    };

    // Adjust based on the actual number of images available.
    const numberOfImages = 13;
    // Calculate the index of the image to use.
    const index = simpleHash(weekOfYear) % numberOfImages;
    // Generate the image name, ensuring it's zero-padded to three digits.
    const imageName = `${(index + 1).toString().padStart(3, '0')}.jpg`;
    // Construct and return the path to the image.
    return `/signin/${imageName}`;
};
