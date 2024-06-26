import { voting_value2 } from "@/components/PostCard/calculateHiveVotingValueForHiveUser";
import { HiveAccount } from "@/lib/useHiveAuth";
import { createContext, useContext, useEffect, useState } from "react";

export interface HiveUserContextProps {
  hiveUser: HiveAccount | null;
  setHiveUser: (user: HiveAccount | null) => void;
  isLoading: boolean | undefined;
  refreshUser: () => void;
  voteValue: number;
}

const HiveUserContext = createContext<HiveUserContextProps | undefined>(
  undefined,
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<HiveAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>();
  const [voteValue, setVoteValue] = useState<number>(0);

  const loadVoteValue = async () => {
    if (voteValue === 0) {
      const value = await voting_value2(user);
      setVoteValue(value);
    }
  };

  const refreshUser = () => {
    const userData = localStorage.getItem("hiveuser");
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
      loadVoteValue()
    }
  }, [user])

  return (
    <HiveUserContext.Provider
      value={{
        hiveUser: user,
        setHiveUser: setUser,
        isLoading,
        refreshUser,
        voteValue,
      }}
    >
      {children}
    </HiveUserContext.Provider>
  );
};

export const useHiveUser: () => HiveUserContextProps = () => {
  const context = useContext(HiveUserContext);
  if (!context) {
    throw new Error("useHiveUser must be used within a UserProvider");
  }
  return context;
};
