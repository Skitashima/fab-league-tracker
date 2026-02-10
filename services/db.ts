import { db } from './firebase';
import {
    collection,
    getDocs,
    setDoc,
    doc,
    query,
    orderBy,
    updateDoc
} from 'firebase/firestore';
import { Player, Tournament, User } from '../types';

// --- Players ---

export const getPlayers = async (): Promise<Player[]> => {
    const q = query(collection(db, 'players'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Player);
};

export const createPlayer = async (player: Player): Promise<void> => {
    await setDoc(doc(db, 'players', player.id), player);
};

export const updatePlayer = async (player: Player): Promise<void> => {
    await setDoc(doc(db, 'players', player.id), player, { merge: true });
};

export const deletePlayer = async (playerId: string): Promise<void> => {
    // Note: Deleting a player might require cleaning up users linked to it. 
    // For now we just implement the db call. 
    // Be careful with this operation.
    // Firestore plain delete: deleteDoc(doc(db, 'players', playerId));
    // But we might want to keep it simple for now or soft delete.
    // Importing deleteDoc if needed.
};

// --- Tournaments ---

export const getTournaments = async (): Promise<Tournament[]> => {
    // Order by date descending usually
    const q = query(collection(db, 'tournaments'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Tournament);
};

export const createTournament = async (tournament: Tournament): Promise<void> => {
    await setDoc(doc(db, 'tournaments', tournament.id), tournament);
};

// --- Users ---

export const getUsers = async (): Promise<User[]> => {
    const q = query(collection(db, 'users'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
};

export const updateUser = async (user: User): Promise<void> => {
    // Password update is handled by Auth, here we update metadata roles/email in Firestore
    const { password, ...userData } = user; // Exclude password from Firestore
    await updateDoc(doc(db, 'users', user.id), userData as any);
};
