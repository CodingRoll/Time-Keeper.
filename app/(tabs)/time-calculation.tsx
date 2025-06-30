import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal, Alert } from 'react-native';
import { Clock, Calculator, RotateCcw, Copy, ChevronDown, X, Plus } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { v4 as uuidv4 } from 'uuid';
import { useRecords } from '../RecordContext';

interface TimeUnit {
  label: string;
  value: 'seconds' | 'minutes' | 'hours' | 'days';
  multiplier: number; // multiplier to convert to hours
}

interface AddRecordData {
  name: string;
  time: string;
  wage: string;
  total: string;
}

const timeUnits: TimeUnit[] = [
  { label: 'Seconds', value: 'seconds', multiplier: 1/3600 },
  { label: 'Minutes', value: 'minutes', multiplier: 1/60 },
  { label: 'Hours', value: 'hours', multiplier: 1 },
  { label: 'Days', value: 'days', multiplier: 8 }, // assuming 8-hour work day
];

export default function TimeCalculationScreen() {
  const [timeValue, setTimeValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<TimeUnit>(timeUnits[2]); // Default to hours
  const [hourlyRate, setHourlyRate] = useState('');
  const [totalPay, setTotalPay] = useState('');
  const [calculatedTime, setCalculatedTime] = useState('');
  
  // Modal states
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordData, setRecordData] = useState<AddRecordData>({
    name: '',
    time: '',
    wage: '',
    total: ''
  });

  const { addRecord } = useRecords();

  const calculatePay = () => {
    if (!timeValue || !hourlyRate) return;
    
    const timeInHours = parseFloat(timeValue) * selectedUnit.multiplier;
    const rate = parseFloat(hourlyRate);
    const pay = timeInHours * rate;
    
    // Format time display
    let timeDisplay = '';
    if (selectedUnit.value === 'hours') {
      const hours = Math.floor(timeInHours);
      const minutes = Math.round((timeInHours - hours) * 60);
      timeDisplay = `${hours}h ${minutes}m`;
    } else if (selectedUnit.value === 'days') {
      timeDisplay = `${timeValue} day${parseFloat(timeValue) !== 1 ? 's' : ''} (${timeInHours}h)`;
    } else {
      timeDisplay = `${timeValue} ${selectedUnit.label.toLowerCase()} (${timeInHours.toFixed(2)}h)`;
    }
    
    setCalculatedTime(timeDisplay);
    setTotalPay(`$${pay.toFixed(2)}`);
  };

  const resetCalculation = () => {
    setTimeValue('');
    setHourlyRate('');
    setTotalPay('');
    setCalculatedTime('');
    setSelectedUnit(timeUnits[2]); // Reset to hours
  };

 const copyResult = async () => {
  if (!totalPay || !calculatedTime) {
    Alert.alert('No Result', 'Please calculate a result first before copying.');
    return;
  }

  const resultText = `Time: ${calculatedTime}\nPay: ${totalPay}`;
  await Clipboard.setStringAsync(resultText);

  Alert.alert(
    'Result Copied!',
    `${resultText}\n\nResult has been copied and is ready to use in Records.`,
    [{ text: 'OK' }]
  );
};
  const openAddRecord = () => {
    if (!totalPay || !calculatedTime) {
      Alert.alert('No Result', 'Please calculate a result first before adding to records.');
      return;
    }
    
    setRecordData({
      name: '',
      time: calculatedTime,
      wage: `$${hourlyRate}/hr`,
      total: totalPay
    });
    setShowAddRecord(true);
  };

  const saveRecord = () => {
    if (!recordData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a name for this record.');
      return;
    }

    const newRecord = {
      id: uuidv4(),
      name: recordData.name,
      time: recordData.time,
      wage: recordData.wage,
      total: recordData.total,
    };

    addRecord(newRecord);

    Alert.alert(
      'Record Saved!',
      `Record "${recordData.name}" has been added successfully.`,
      [{ text: 'OK', onPress: () => setShowAddRecord(false) }]
    );

    setRecordData({ name: '', time: '', wage: '', total: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Clock size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Time Calculation</Text>
          <Text style={styles.subtitle}>Calculate your working hours and pay</Text>
        </View>

        {/* Time Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Time & Cost Input</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.inputLabel}>Time Value</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="1.5"
                value={timeValue}
                onChangeText={setTimeValue}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.unitPickerContainer}>
              <Text style={styles.inputLabel}>Unit</Text>
              <TouchableOpacity 
                style={styles.unitPicker}
                onPress={() => setShowUnitPicker(true)}
              >
                <Text style={styles.unitPickerText}>{selectedUnit.label}</Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hourly Rate ($)</Text>
            <TextInput
              style={styles.fullWidthInput}
              placeholder="16.50"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.calculateButton} onPress={calculatePay}>
            <Calculator size={20} color="#FFFFFF" />
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetCalculation}>
            <RotateCcw size={20} color="#6B7280" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Result Section */}
        {totalPay && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Calculation Result</Text>
            <View style={styles.resultDetails}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Time:</Text>
                <Text style={styles.resultValue}>{calculatedTime}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rate:</Text>
                <Text style={styles.resultValue}>${hourlyRate}/hr</Text>
              </View>
            </View>
            <Text style={styles.totalPay}>{totalPay}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionButtons}>
            <TouchableOpacity 
              style={[styles.quickActionButton, !totalPay && styles.disabledButton]} 
              onPress={copyResult}
              disabled={!totalPay}
            >
              <Copy size={24} color={!totalPay ? "#D1D5DB" : "#10B981"} />
              <Text style={[styles.quickActionText, !totalPay && styles.disabledText]}>
                Copy Result
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, !totalPay && styles.disabledButton]} 
              onPress={openAddRecord}
              disabled={!totalPay}
            >
              <Plus size={24} color={!totalPay ? "#D1D5DB" : "#F59E0B"} />
              <Text style={[styles.quickActionText, !totalPay && styles.disabledText]}>
                Add to Records
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unit Picker Modal */}
        <Modal
          visible={showUnitPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowUnitPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time Unit</Text>
                <TouchableOpacity onPress={() => setShowUnitPicker(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              {timeUnits.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    selectedUnit.value === unit.value && styles.selectedUnitOption
                  ]}
                  onPress={() => {
                    setSelectedUnit(unit);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text style={[
                    styles.unitOptionText,
                    selectedUnit.value === unit.value && styles.selectedUnitText
                  ]}>
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Add Record Modal */}
        <Modal
          visible={showAddRecord}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddRecord(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add to Records</Text>
                <TouchableOpacity onPress={() => setShowAddRecord(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Record Name *</Text>
                  <TextInput
                    style={styles.fullWidthInput}
                    placeholder="e.g., Morning Shift, Project Work"
                    value={recordData.name}
                    onChangeText={(text) => setRecordData({...recordData, name: text})}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    style={[styles.fullWidthInput, styles.readOnlyInput]}
                    value={recordData.time}
                    editable={false}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Wage</Text>
                  <TextInput
                    style={[styles.fullWidthInput, styles.readOnlyInput]}
                    value={recordData.wage}
                    editable={false}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Total</Text>
                  <TextInput
                    style={[styles.fullWidthInput, styles.readOnlyInput]}
                    value={recordData.total}
                    editable={false}
                  />
                </View>
              </View>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveRecord}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeInputContainer: {
    flex: 2,
  },
  unitPickerContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  unitPicker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  unitPickerText: {
    fontSize: 16,
    color: '#111827',
  },
  fullWidthInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultDetails: {
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalPay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  unitOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedUnitOption: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedUnitText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  recordForm: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});