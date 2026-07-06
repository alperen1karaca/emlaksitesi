"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { query, collection, where, onSnapshot } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let unsubscribeUserDoc: () => void = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);

            if (authUser) {
                // Listen to any document in 'users' where this email has admin role
                const q = query(
                    collection(db, "users"),
                    where("email", "==", authUser.email),
                    where("role", "==", "admin")
                );

                unsubscribeUserDoc = onSnapshot(q, (snapshot) => {
                    setIsAdmin(!snapshot.empty);
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore admin check error:", error);
                    setLoading(false);
                });
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeUserDoc();
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
