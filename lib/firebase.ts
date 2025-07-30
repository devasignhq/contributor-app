import { ROUTES } from '@/app/utils/data';
import { useClearStores } from '@/app/utils/hooks';
import { useLockFn, useAsyncEffect, clearCache } from 'ahooks';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GithubAuthProvider, User } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const githubProvider = new GithubAuthProvider();

export async function getCurrentUser() {
    const userPromise = new Promise<User | null>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });

    const user = await userPromise;

    return user;
}

export function useLogoutUser() {
    const router = useRouter();
    const clearStores = useClearStores();

    const logoutUser = useLockFn(async () => {
        try {
            await auth.signOut();

            clearCache("");
            clearStores();
            router.push(ROUTES.AUTHENTICATE);
        } catch(error) {
            console.log(error)
            alert("Something went wrong. Please try again.");
        }
    })

    return logoutUser;
};

// Checks if the user is signed out (used in pages where user needs to be authenticated before access is given)
export const useUnauthenticatedUserCheck = () => {
    const router = useRouter();

    useAsyncEffect(async () => {
        const user = await getCurrentUser();

        if (!user) {
            router.push(ROUTES.AUTHENTICATE)
        }
    }, [router]);
}

// Checks if the user is signed in (used in authentication pages to redirect signed in users)
export const useAuthenticatedUserCheck = () => {
    const router = useRouter();
    
    useAsyncEffect(async () => {
        const user = await getCurrentUser();

        if (user) {
            router.push(ROUTES.TASKS)
        }
    }, [router]);
    
    return router
}