// Firestore Security Rules for User-Scoped Data
// Add this to your Firebase Console > Firestore Database > Rules tab

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write only for authenticated users on their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // User's goals collection
      match /goals/{goalId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      // User's timer sessions collection
      match /timerSessions/{sessionId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// HOW TO APPLY:
// 1. Go to Firebase Console (https://console.firebase.google.com)
// 2. Select your project (timer-89c3e)
// 3. Go to Firestore Database
// 4. Click on the "Rules" tab
// 5. Replace all content with the rules above
// 6. Click "Publish"

// This ensures:
// - Each user can only access their own data
// - No user can access another user's goals or timer sessions
// - Unauthenticated users cannot access any data
// - Data is completely isolated per user
