import React, { useState } from 'react';
import { Modal, TextInput } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { FileText, Plus, Calendar, Clock, Filter } from 'lucide-react-native';
import { useRecords } from '../RecordContext';

export default function RecordsScreen() {
  const { records, updateRecord, timeRecords, setTimeRecords, updateTimeRecord } = useRecords();
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecordType, setEditingRecordType] = useState<'calculation' | 'manual' | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [newRecord, setNewRecord] = useState({
    date: '',
    startTime: '',
    endTime: '',
    breakTime: '',
    totalHours: '',
    project: '',
    other: '',
    name: '',
    time: '',
    wage: '',
    total: '',
  });
  
  const resetModalState = () => {
    setModalVisible(false);
    setNewRecord({
      date: '',
      startTime: '',
      endTime: '',
      breakTime: '',
      totalHours: '',
      project: '',
      other: '',
      name: '',
      time: '',
      wage: '',
      total: '',
    });
    setEditingRecordId(null);
    setEditingRecordType(null);
  };

  const openAddRecordModal = () => {
    resetModalState();
    setEditingRecordType('manual');
    setModalVisible(true);
  };

  // Filter logic
  const filteredCalcRecords = records.filter(item =>
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredManualRecords = timeRecords.filter(item =>
    item.project.toLowerCase().includes(filterText.toLowerCase()) ||
    item.date.toLowerCase().includes(filterText.toLowerCase())
  );
  
  const renderRecord = ({ item }: { item: typeof records[0] }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.dateText}>{item.name}</Text>
        </View>
        <Text style={styles.projectText}>Calculation</Text>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Time:</Text>
          <Text style={styles.timeValue}>{item.time}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Wage:</Text>
          <Text style={styles.timeValue}>{item.wage}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Total:</Text>
          <Text style={styles.timeValue}>{item.total}</Text>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Clock size={16} color="#3B82F6" />
        <Text style={styles.totalHours}>{item.total}</Text>
      </View>
      
      <TouchableOpacity
        onPress={() => {
          setNewRecord({
            date: '',
            startTime: '',
            endTime: '',
            breakTime: '',
            totalHours: '',
            project: '',
            other: '',
            name: item.name,
            time: item.time,
            wage: item.wage,
            total: item.total,
          });
          setEditingRecordId(item.id);
          setEditingRecordType('calculation');
          setModalVisible(true);
        }}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeRecord = ({ item }: { item: typeof timeRecords[0] }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.projectText}>{item.project}</Text>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Start:</Text>
          <Text style={styles.timeValue}>{item.startTime}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>End:</Text>
          <Text style={styles.timeValue}>{item.endTime}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Break:</Text>
          <Text style={styles.timeValue}>{item.breakTime}m</Text>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Clock size={16} color="#3B82F6" />
        <Text style={styles.totalHours}>{item.totalHours}</Text>
      </View>
      
      <TouchableOpacity
        onPress={() => {
          setNewRecord({
            date: item.date,
            startTime: item.startTime,
            endTime: item.endTime,
            breakTime: item.breakTime,
            totalHours: item.totalHours,
            project: item.project,
            other: '',
            name: '',
            time: '',
            wage: '',
            total: '',
          });
          setEditingRecordId(item.id);
          setEditingRecordType('manual');
          setModalVisible(true);
        }}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const getTotalHours = () => {
    // Simple calculation for demo
    return (records.length + timeRecords.length) * 8; // assuming 8 hours per record on average
  };

  const handleSave = () => {
    if (editingRecordType === 'calculation') {
      if (!newRecord.name.trim()) {
        Alert.alert('Missing Information', 'Please enter a name for this record.');
        return;
      }
      
      if (editingRecordId) {
        // Update existing calculation record
        updateRecord(editingRecordId, {
          name: newRecord.name,
          time: newRecord.time,
          wage: newRecord.wage,
          total: newRecord.total,
        });
        Alert.alert('Success', 'Record updated successfully!');
      }
    } else if (editingRecordType === 'manual') {
      // Validate required fields for manual records
      if (!newRecord.date.trim() || !newRecord.startTime.trim() || !newRecord.endTime.trim()) {
        Alert.alert('Missing Information', 'Please fill in date, start time, and end time.');
        return;
      }

      if (editingRecordId) {
        // Update existing manual record
        updateTimeRecord(editingRecordId, {
          date: newRecord.date,
          startTime: newRecord.startTime,
          endTime: newRecord.endTime,
          breakTime: newRecord.breakTime,
          totalHours: newRecord.totalHours,
          project: newRecord.project || 'Other',
        });
        Alert.alert('Success', 'Record updated successfully!');
      } else {
        // Create new manual record
        const newEntry = {
          id: uuidv4(),
          date: newRecord.date,
          startTime: newRecord.startTime,
          endTime: newRecord.endTime,
          breakTime: newRecord.breakTime,
          totalHours: newRecord.totalHours,
          project: newRecord.project || 'Other',
        };
        setTimeRecords([...timeRecords, newEntry]);
        Alert.alert('Success', 'New record added successfully!');
      }
    }

    // Reset modal state
    resetModalState();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <FileText size={32} color="#14B8A6" />
          </View>
          <Text style={styles.title}>Records</Text>
          <Text style={styles.subtitle}>Manage and view your time records</Text>
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={resetModalState}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingRecordId ? 'Edit Record' : 'Add New Record'}
                </Text>
                <TouchableOpacity onPress={resetModalState} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                {editingRecordType === 'calculation' ? (
                  // Fields for calculation records
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Name *</Text>
                      <TextInput
                        placeholder="Enter record name"
                        value={newRecord.name}
                        onChangeText={(text) => setNewRecord({ ...newRecord, name: text })}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Time</Text>
                      <TextInput
                        placeholder="Time worked"
                        value={newRecord.time}
                        onChangeText={(text) => setNewRecord({ ...newRecord, time: text })}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Wage</Text>
                      <TextInput
                        placeholder="Hourly wage"
                        value={newRecord.wage}
                        onChangeText={(text) => setNewRecord({ ...newRecord, wage: text })}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Total</Text>
                      <TextInput
                        placeholder="Total pay"
                        value={newRecord.total}
                        onChangeText={(text) => setNewRecord({ ...newRecord, total: text })}
                        style={styles.textInput}
                      />
                    </View>
                  </>
                ) : (
                  // Fields for manual time records
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Date *</Text>
                      <TextInput
                        placeholder="YYYY-MM-DD"
                        value={newRecord.date}
                        onChangeText={(text) => setNewRecord({ ...newRecord, date: text })}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Start Time *</Text>
                      <TextInput
                        placeholder="HH:MM"
                        value={newRecord.startTime}
                        onChangeText={(text) => setNewRecord({ ...newRecord, startTime: text })}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>End Time *</Text>
                      <TextInput
                        placeholder="HH:MM"
                        value={newRecord.endTime}
                        onChangeText={(text) => setNewRecord({ ...newRecord, endTime: text })}
                        style={styles.textInput}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Break Time (minutes)</Text>
                      <TextInput
                        placeholder="30"
                        value={newRecord.breakTime}
                        onChangeText={(text) => setNewRecord({ ...newRecord, breakTime: text })}
                        style={styles.textInput}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Total Hours</Text>
                      <TextInput
                        placeholder="8.5"
                        value={newRecord.totalHours}
                        onChangeText={(text) => setNewRecord({ ...newRecord, totalHours: text })}
                        style={styles.textInput}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Project</Text>
                      <TextInput
                        placeholder="Project name"
                        value={newRecord.project}
                        onChangeText={(text) => setNewRecord({ ...newRecord, project: text })}
                        style={styles.textInput}
                      />
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={resetModalState}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>
                    {editingRecordId ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{records.length + timeRecords.length}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getTotalHours()}h</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={openAddRecordModal}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Record</Text>
          </TouchableOpacity>
          

        </View>

        {/* Filter Input */}
        <View style={styles.filterContainer}>
          <TextInput
            placeholder="Filter by project or name"
            value={filterText}
            onChangeText={setFilterText}
            style={styles.filterInput}
          />
        </View>

        {/* Records List */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Recent Records</Text>
          
          {(filteredCalcRecords.length > 0 || filteredManualRecords.length > 0) ? (
            <View style={styles.recordsList}>
              {filteredCalcRecords.map((item) => renderRecord({ item }))}
              {filteredManualRecords.map((item) => renderTimeRecord({ item }))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FileText size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>
                {filterText ? 'No Matching Records' : 'No Records Yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {filterText 
                  ? 'Try adjusting your filter criteria'
                  : 'Start by adding your first time record'
                }
              </Text>
            </View>
          )}
        </View>
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
    backgroundColor: '#F0FDFA',
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addButton: {
    flex: 2,
    backgroundColor: '#14B8A6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
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
  filterButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  recordsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  projectText: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  recordDetails: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 8,
  },
  totalHours: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  editButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#EBF8FF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
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
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalForm: {
    maxHeight: 300,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});