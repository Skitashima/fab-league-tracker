import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserRole } from '../types';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, pass: string) => Promise<void>;
    signup: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
                    } else {
                        // User exists in Auth but not in Firestore
                        console.warn("User Authenticated but no profile found in Firestore.");
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Auth Actions
    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (email: string, pass: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;

        // Create User Profile in Firestore
        const newPlayerId = fbUser.uid; // Use UID as PlayerID for simplicity or generate one
        const role: UserRole = email.toLowerCase() === 'santiagokita@gmail.com' ? 'ADMIN' : 'PLAYER';

        const newUser: User = {
            id: fbUser.uid,
            email: email,
            role: role,
            playerId: newPlayerId
        };

        // 1. Create User Document
        await setDoc(doc(db, 'users', fbUser.uid), newUser);

        // 2. Create Player Document (We need to import this logic or do it here)
        // For now, we do it here directly to ensure atomicity-ish consistency
        const newPlayer = {
            id: newPlayerId,
            name: name,
            heroStats: {},
            tournamentsPlayed: 0,
            totalWins: 0,
            totalPoints: 0,
            recentPerformance: []
        };
        await setDoc(doc(db, 'players', newPlayerId), newPlayer);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
        loading,
        isAdmin: currentUser?.role === 'ADMIN',
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
