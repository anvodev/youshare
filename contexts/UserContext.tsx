import { createContext } from "react";

export type UserData = {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
};
const userData: UserData | null = null
const UserContext = createContext({
  user: userData,
  login: (userData: UserData) => {},
  logout: () => {},
});

export default UserContext;
