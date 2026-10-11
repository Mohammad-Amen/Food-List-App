import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { getProfile, isSignUpInProgress } from './api';
import { getAuthInstance, getDb, isFirebaseConfigured } from './firebase';
import type { UserProfile } from './types';
import { emailToHandle } from './username';

interface AuthState {
  loading: boolean;
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
}

const AuthContext = createContext<AuthState>({ loading: true, profile: null, setProfile: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getAuthInstance(), async (user) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      if (isSignUpInProgress()) return; // the sign-up screen calls setProfile
      try {
        let p = await getProfile(user.uid);
        if (!p && user.email) {
          // Sign-up was interrupted before the profile doc was written; rebuild it.
          const username = emailToHandle(user.email);
          if (username) {
            const displayName = username.slice(0, username.lastIndexOf('#'));
            p = { uid: user.uid, username, usernameLower: username.toLowerCase(), displayName };
            await setDoc(doc(getDb(), 'users', user.uid), {
              username: p.username,
              usernameLower: p.usernameLower,
              displayName,
              createdAt: Date.now(),
            });
          }
        }
        setProfile(p);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return <AuthContext.Provider value={{ loading, profile, setProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

/** For screens inside the signed-in area, where a profile is guaranteed. */
export function useMe(): UserProfile {
  const { profile } = useAuth();
  if (!profile) throw new Error('useMe used outside the signed-in area');
  return profile;
}
