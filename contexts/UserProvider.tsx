'use client';

import { useEffect, useState } from "react";

import UserContext, { UserData } from "./UserContext";

interface UserProviderProps {
  children: React.ReactNode
}

const UserProvider = ({ children }: UserProviderProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("YOUSHARE_USER");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
    console.log("user", userData)
  }, []);

  const login = (userData: UserData) => {
    setUserData(userData);
    localStorage.setItem("YOUSHARE_USER", JSON.stringify(userData));
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem("YOUSHARE_USER");
  };

  return (
    // @ts-ignore
    <UserContext.Provider value={{ user: userData, login, logout }}>
      {children}
    </UserContext.Provider>
  )
};


export default UserProvider;
