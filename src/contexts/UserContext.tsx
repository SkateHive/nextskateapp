import { voting_value2 } from "@/components/PostCard/calculateHiveVotingValueForHiveUser";
import { HiveAccount } from "@/lib/useHiveAuth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface HiveUserContextProps {
  hiveUser: HiveAccount | null;
  setHiveUser: (user: HiveAccount | null) => void;
  isLoading: boolean | undefined;
  refreshUser: () => void;
  voteValue: number;
}

const HiveUserContext = createContext<HiveUserContextProps | undefined>(
  undefined
);

// Split UserContext into two: UserDataContext and UserLoadingContext
export const UserDataContext = createContext<HiveAccount | null>(null);
export const UserLoadingContext = createContext<boolean>(false);
export const VoteValueContext = createContext<number>(0);
export const UserSetContext = createContext<((user: HiveAccount | null) => void) | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<HiveAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [voteValue, setVoteValue] = useState<number>(0);

  const loadVoteValue = async () => {
    if (voteValue === 0) {
      const value = await voting_value2(user);
      setVoteValue(value);
    }
  };

  const refreshUser = () => {
    const userData = localStorage.getItem("hiveuser");
    console.debug(
      "[UserContext] refreshUser: localStorage.hiveuser =",
      userData
    );
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();
    loadVoteValue();
  }, []);

  useEffect(() => {
    if (user) {
      loadVoteValue();
    }
  }, [user]);

  // Memoize values for each context
  const userValue = useMemo(() => user, [user]);
  const loadingValue = useMemo(() => isLoading, [isLoading]);
  const voteValueMemo = useMemo(() => voteValue, [voteValue]);

  return (
    <UserDataContext.Provider value={userValue}>
      <UserSetContext.Provider value={setUser}>
        <UserLoadingContext.Provider value={loadingValue}>
          <VoteValueContext.Provider value={voteValueMemo}>
            {children}
          </VoteValueContext.Provider>
        </UserLoadingContext.Provider>
      </UserSetContext.Provider>
    </UserDataContext.Provider>
  );
};

// Custom hooks for new split contexts
export const useUserData = () => useContext(UserDataContext);
export const useUserLoading = () => useContext(UserLoadingContext);
export const useVoteValue = () => useContext(VoteValueContext);
export const useSetUser = () => {
  const setUser = useContext(UserSetContext);
  if (!setUser) throw new Error('useSetUser must be used within a UserProvider');
  return setUser;
};

// Optionally, keep the old useHiveUser for backward compatibility (deprecated)
export const useHiveUser: () => HiveUserContextProps = () => {
  const user = useContext(UserDataContext);
  const isLoading = useContext(UserLoadingContext);
  // Provide a minimal fallback for legacy consumers
  return {
    hiveUser: user,
    setHiveUser: () => {}, // Not supported in split context
    isLoading,
    refreshUser: () => {}, // Not supported in split context
    voteValue: 0, // Not supported in split context
  };
};
