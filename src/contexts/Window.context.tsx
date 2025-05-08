import { createContext, ReactNode, useContext, useState } from "react";
import { WindowEnum } from "../enums/Windows.enum";

interface WindowContextType {
  focusedWindow: WindowEnum | undefined;
  setFocusedWindow: React.Dispatch<React.SetStateAction<WindowEnum | undefined>>,
  openedWindows: WindowEnum[],
  setOpenedWindows: React.Dispatch<React.SetStateAction<WindowEnum[]>>,
}

interface WindowProviderType {
  children: ReactNode
}

export const WindowContext = createContext<WindowContextType | null>(null);

export const WindowProvider = ({ children }: WindowProviderType) => {
  const [focusedWindow, setFocusedWindow] = useState<WindowEnum | undefined>(undefined);
  const [openedWindows, setOpenedWindows] = useState<WindowEnum[]>([]);
  
  const contextValue: WindowContextType = {
    focusedWindow,
    openedWindows,
    setFocusedWindow,
    setOpenedWindows
  }

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowContext = () => {
  const currentUserContext = useContext(WindowContext);

  if (!currentUserContext) {
    throw new Error(
      "useWindowContext has to be used within <WindowContext.Provider>"
    );
  }

  return currentUserContext;
};