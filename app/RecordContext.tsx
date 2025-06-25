import React, { createContext, useContext, useState } from 'react';

export interface RecordItem {
  id: string;
  name: string;
  time: string;
  wage: string;
  total: string;
}

export interface TimeRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  totalHours: string;
  project: string;
}

interface RecordContextType {
  records: RecordItem[];
  timeRecords: TimeRecord[];
  addRecord: (record: RecordItem) => void;
  updateRecord: (id: string, updatedRecord: Partial<RecordItem>) => void;
  setTimeRecords: React.Dispatch<React.SetStateAction<TimeRecord[]>>;
  updateTimeRecord: (id: string, updatedRecord: Partial<TimeRecord>) => void;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const RecordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);

  const addRecord = (record: RecordItem) => {
    setRecords((prev) => [...prev, record]);
  };

  const updateRecord = (id: string, updatedRecord: Partial<RecordItem>) => {
    setRecords((prev) => 
      prev.map((record) => 
        record.id === id ? { ...record, ...updatedRecord } : record
      )
    );
  };

  const updateTimeRecord = (id: string, updatedRecord: Partial<TimeRecord>) => {
    setTimeRecords((prev) => 
      prev.map((record) => 
        record.id === id ? { ...record, ...updatedRecord } : record
      )
    );
  };

  return (
    <RecordContext.Provider value={{ 
      records, 
      timeRecords, 
      addRecord, 
      updateRecord, 
      setTimeRecords,
      updateTimeRecord 
    }}>
      {children}
    </RecordContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordProvider');
  }
  return context;
};