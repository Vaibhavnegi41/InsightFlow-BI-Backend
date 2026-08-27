import React, { createContext, useContext, useState, useEffect } from 'react';
import { datasetsAPI, alertsAPI } from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [datasets, setDatasets] = useState([]);
  const [activeDataset, setActiveDataset] = useState(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [alertHistory, setAlertHistory] = useState([]);

  const refreshDatasets = async () => {
    try {
      setLoadingDatasets(true);
      const res = await datasetsAPI.list();
      const list = res.data.datasets || [];
      setDatasets(list);
      
      // If no active dataset selected, pick the first one
      if (list.length > 0) {
        if (!activeDataset || !list.find(d => d.id === activeDataset.id)) {
          setActiveDataset(list[0]);
        }
      } else {
        setActiveDataset(null);
      }
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const refreshAlerts = async () => {
    try {
      const res = await alertsAPI.history();
      setAlertHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to fetch alert history:', err);
    }
  };

  useEffect(() => {
    refreshDatasets();
    refreshAlerts();
  }, []);

  return (
    <DataContext.Provider value={{
      datasets,
      activeDataset,
      setActiveDataset,
      loadingDatasets,
      refreshDatasets,
      alertHistory,
      refreshAlerts
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
