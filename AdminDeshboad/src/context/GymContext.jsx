import React, { createContext, useState, useContext } from 'react';
import { gymData as initialGymData } from '../data/gymData';

// Create the Context
const GymContext = createContext();

/**
 * GymProvider component to provide gym data across the application.
 */
export const GymProvider = ({ children }) => {
  const [gyms, setGyms] = useState(initialGymData);

  // Future extensions like add, update, delete can be added here
  const addGym = (newGym) => {
    setGyms([...gyms, { ...newGym, id: gyms.length + 1 }]);
  };

  const updateGymStatus = (id, status) => {
    setGyms(gyms.map(gym => gym.id === id ? { ...gym, status } : gym));
  };

  const deleteGym = (id) => {
    setGyms(gyms.filter(gym => gym.id !== id));
  };

  return (
    <GymContext.Provider value={{ gyms, addGym, updateGymStatus, deleteGym }}>
      {children}
    </GymContext.Provider>
  );
};

/**
 * Custom hook to use the GymContext.
 */
export const useGyms = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGyms must be used within a GymProvider');
  }
  return context;
};

export default GymContext;
