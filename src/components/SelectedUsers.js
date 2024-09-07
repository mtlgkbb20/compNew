import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const SelectedUsersContext = createContext();

// Create the provider component
export const SelectedUsersProvider = ({ children }) => {
  const [selectedUsersLast, setSelectedUsersLast] = useState(() => {
    const savedUsers = localStorage.getItem('selectedUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  useEffect(() => {
    localStorage.setItem('selectedUsers', JSON.stringify(selectedUsersLast));
  }, [selectedUsersLast]);

  return (
    <SelectedUsersContext.Provider value={{ selectedUsersLast, setSelectedUsersLast }}>
      {children}
    </SelectedUsersContext.Provider>
  );
};

// Custom hook to use the context
export const useSelectedUsers = () => {
  return useContext(SelectedUsersContext);
};
