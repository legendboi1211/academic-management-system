import { db } from '@/lib/firebase';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const resetAllData = async () => {
  try {
    // Reset Firestore collections
    const goalsCollection = collection(db, 'goals');
    const goalsSnapshot = await getDocs(query(goalsCollection));
    for (const docSnap of goalsSnapshot.docs) {
      await deleteDoc(doc(db, 'goals', docSnap.id));
    }

    const timerCollection = collection(db, 'timerSessions');
    const timerSnapshot = await getDocs(query(timerCollection));
    for (const docSnap of timerSnapshot.docs) {
      await deleteDoc(doc(db, 'timerSessions', docSnap.id));
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
