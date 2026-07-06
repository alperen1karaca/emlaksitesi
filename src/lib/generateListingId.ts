import { db } from "./firebase";
import { doc, runTransaction } from "firebase/firestore";

/**
 * Generates a unique listing ID in the format SSYYN.
 * - "SS" is the company prefix.
 * - "YY" is the last two digits of the current year.
 * - "N" is an auto-increment number starting from 1 each year.
 * 
 * Uses Firestore transaction on `counters/listings` doc for atomic incrementing.
 */
export async function generateListingId(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2); // e.g. "26"
    const counterRef = doc(db, "counters", "listings");

    const newId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let count = 1;

        if (counterDoc.exists()) {
            const data = counterDoc.data();
            if (data?.year === currentYear) {
                count = (data.count || 0) + 1;
            }
            // If the year is different, count resets to 1
        }

        transaction.set(counterRef, { year: currentYear, count });

        return `SS${currentYear}${count}`;
    });

    return newId;
}
