import { db } from '@/lib/firebase';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Reset all user's data (user-specific)
export const resetUserData = async (userId: string) => {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    // Reset user-specific goals
    const goalsCollection = collection(db, 'users', userId, 'goals');
    const goalsSnapshot = await getDocs(query(goalsCollection));
    for (const docSnap of goalsSnapshot.docs) {
      await deleteDoc(doc(db, 'users', userId, 'goals', docSnap.id));
    }

    // Reset user-specific timer sessions
    const timerCollection = collection(db, 'users', userId, 'timerSessions');
    const timerSnapshot = await getDocs(query(timerCollection));
    for (const docSnap of timerSnapshot.docs) {
      await deleteDoc(doc(db, 'users', userId, 'timerSessions', docSnap.id));
    }

    // Reset localStorage
    localStorage.removeItem('academic-notes');
    localStorage.removeItem('academic-goals');

    return { success: true, message: 'All data has been reset to 0' };
  } catch (error) {
    console.error('Error resetting data:', error);
    return { success: false, message: 'Error resetting data', error };
  }
};

// Legacy function for backward compatibility (will reset all public data)
export const resetAllData = async () => {
  try {
    // Reset localStorage
    localStorage.removeItem('academic-notes');
    localStorage.removeItem('academic-goals');

    return { success: true, message: 'All local data has been reset to 0' };
  } catch (error) {
    console.error('Error resetting data:', error);
    return { success: false, message: 'Error resetting data', error };
  }
};
