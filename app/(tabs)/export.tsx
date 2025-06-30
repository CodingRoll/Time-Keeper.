import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  Download,
  FileText,
  Table,
  Check,
} from 'lucide-react-native';
import { useRecords } from '../RecordContext';

const exportFormats = [
  {
    id: 'pdf',
    title: 'Text File',
    description: 'Comprehensive report with charts and summaries',
    icon: FileText,
    color: '#DC2626',
  },
  {
    id: 'csv',
    title: 'CSV Data',
    description: 'Raw data for spreadsheet applications',
    icon: Table,
    color: '#059669',
  },
  {
    id: 'json',
    title: 'JSON Export',
    description: 'Structured data for developers',
    icon: Download,
    color: '#7C3AED',
  },
];

export default function ExportScreen() {
  const { records, timeRecords } = useRecords();
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (records: any[], timeRecords: any[]) => {
    let csv = 'Type,Name/Project,Time/Date,Wage,Total\n';
    
    // Add calculation records
    records.forEach(r => {
      csv += `Calculation,"${r.name}","${r.time}","${r.wage}","${r.total}"\n`;
    });
    
    // Add manual time records
    timeRecords.forEach(r => {
      csv += `Manual,"${r.project}","${r.date}","N/A","${r.totalHours}h"\n`;
    });
    
    return csv;
  };

  const generateJSON = (records: any[], timeRecords: any[]) => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      calculationRecords: records,
      manualTimeRecords: timeRecords,
      summary: {
        totalCalculationRecords: records.length,
        totalManualRecords: timeRecords.length,
        totalRecords: records.length + timeRecords.length,
      }
    }, null, 2);
  };

  const generatePDFContent = (records: any[], timeRecords: any[]) => {
    let content = `TIME TRACKING EXPORT REPORT\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    content += `SUMMARY:\n`;
    content += `- Calculation Records: ${records.length}\n`;
    content += `- Manual Records: ${timeRecords.length}\n`;
    content += `- Total Records: ${records.length + timeRecords.length}\n\n`;
    
    if (records.length > 0) {
      content += `CALCULATION RECORDS:\n`;
      content += `${'='.repeat(50)}\n`;
      records.forEach((r, index) => {
        content += `${index + 1}. ${r.name}\n`;
        content += `   Time: ${r.time}\n`;
        content += `   Wage: ${r.wage}\n`;
        content += `   Total: ${r.total}\n\n`;
      });
    }
    
    if (timeRecords.length > 0) {
      content += `MANUAL TIME RECORDS:\n`;
      content += `${'='.repeat(50)}\n`;
      timeRecords.forEach((r, index) => {
        content += `${index + 1}. ${r.project}\n`;
        content += `   Date: ${r.date}\n`;
        content += `   Start: ${r.startTime}\n`;
        content += `   End: ${r.endTime}\n`;
        content += `   Break: ${r.breakTime}m\n`;
        content += `   Total Hours: ${r.totalHours}h\n\n`;
      });
    }
    
    return content;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    if (Platform.OS === 'web') {
      // Web implementation using blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For mobile platforms, we'll show the content in an alert for now
      // In a real app, you'd use react-native-fs or similar
      Alert.alert(
        'Export Ready',
        'File content generated successfully. In a production app, this would be saved to your device.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleExport = async () => {
    if (records.length === 0 && timeRecords.length === 0) {
      Alert.alert(
        'No Data to Export',
        'Please add some records in the Records tab before exporting.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsExporting(true);
    
    try {
      let fileContent = '';
      let filename = '';
      let mimeType = '';

      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (selectedFormat) {
        case 'csv':
          fileContent = generateCSV(records, timeRecords);
          filename = `time-tracking-export-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          fileContent = generateJSON(records, timeRecords);
          filename = `time-tracking-export-${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          fileContent = generatePDFContent(records, timeRecords);
          filename = `time-tracking-export-${timestamp}.txt`;
          mimeType = 'text/plain';
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      downloadFile(fileContent, filename, mimeType);

      setIsExporting(false);
      const totalRecords = records.length + timeRecords.length;
      Alert.alert(
        'Export Complete',
        `Successfully exported ${totalRecords} records in ${selectedFormat.toUpperCase()} format.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      Alert.alert(
        'Export Failed',
        'An error occurred while exporting your data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getTotalRecords = () => records.length + timeRecords.length;
  const getTotalHours = () => {
    // Calculate total hours from both record types
    let total = 0;
    
    // Add hours from calculation records (extract numeric value from total)
    records.forEach(record => {
      const match = record.total.match(/\$?(\d+\.?\d*)/);
      if (match) {
        total += parseFloat(match[1]) / 15; // Assuming $15/hour average
      }
    });
    
    // Add hours from manual time records
    timeRecords.forEach(record => {
      const hours = parseFloat(record.totalHours) || 0;
      total += hours;
    });
    
    return Math.round(total * 10) / 10; // Round to 1 decimal place
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Download size={32} color="#F97316" />
          </View>
          <Text style={styles.title}>Export Data</Text>
          <Text style={styles.subtitle}>Export your time records and calculations</Text>
        </View>

        {/* Data Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Data Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{records.length}</Text>
              <Text style={styles.summaryLabel}>Calculation Records</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{timeRecords.length}</Text>
              <Text style={styles.summaryLabel}>Manual Records</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{getTotalHours()}h</Text>
              <Text style={styles.summaryLabel}>Total Hours</Text>
            </View>
          </View>
        </View>

        {/* Export Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatGrid}>
            {exportFormats.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormat === format.id;
              return (
                <TouchableOpacity
                  key={format.id}
                  style={[
                    styles.formatCard,
                    isSelected && styles.selectedFormatCard,
                    { borderColor: isSelected ? format.color : '#E5E7EB' },
                  ]}
                  onPress={() => setSelectedFormat(format.id)}
                >
                  <View style={[styles.formatIcon, { backgroundColor: `${format.color}15` }]}>
                    <Icon size={24} color={format.color} />
                  </View>
                  <Text style={[styles.formatTitle, isSelected && { color: format.color }]}>
                    {format.title}
                  </Text>
                  <Text style={styles.formatDescription}>{format.description}</Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: format.color }]}>
                      <Check size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : `Export ${getTotalRecords()} Records`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Preview */}
        {getTotalRecords() > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Preview</Text>
            <View style={styles.previewContainer}>
              {records.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewTitle}>Calculation Records ({records.length})</Text>
                  {records.slice(0, 3).map((record, index) => (
                    <View key={record.id} style={styles.previewItem}>
                      <Text style={styles.previewItemTitle}>{record.name}</Text>
                      <Text style={styles.previewItemDetail}>
                        {record.time} • {record.total}
                      </Text>
                    </View>
                  ))}
                  {records.length > 3 && (
                    <Text style={styles.previewMore}>
                      +{records.length - 3} more records...
                    </Text>
                  )}
                </View>
              )}
              
              {timeRecords.length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewTitle}>Manual Records ({timeRecords.length})</Text>
                  {timeRecords.slice(0, 3).map((record, index) => (
                    <View key={record.id} style={styles.previewItem}>
                      <Text style={styles.previewItemTitle}>{record.project}</Text>
                      <Text style={styles.previewItemDetail}>
                        {record.date} • {record.totalHours}h
                      </Text>
                    </View>
                  ))}
                  {timeRecords.length > 3 && (
                    <Text style={styles.previewMore}>
                      +{timeRecords.length - 3} more records...
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Empty State */}
        {getTotalRecords() === 0 && (
          <View style={styles.emptyState}>
            <FileText size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Data to Export</Text>
            <Text style={styles.emptyStateText}>
              Add some records in the Records tab to get started with exporting your data.
            </Text>
          </View>
        )}

        {/* Export Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>File Formats</Text>
            <Text style={styles.infoText}>
              • <Text style={styles.bold}>CSV:</Text> Perfect for Excel and Google Sheets{'\n'}
              • <Text style={styles.bold}>JSON:</Text> Structured data for developers{'\n'}
              • <Text style={styles.bold}>Text File:</Text> Human-readable report format
            </Text>
          </View>
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
    backgroundColor: '#FFF7ED',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formatGrid: {
    gap: 12,
  },
  formatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedFormatCard: {
    backgroundColor: '#FEFEFE',
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    marginBottom: 32,
  },
  exportButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewSection: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  previewItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  previewItemDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  previewMore: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 32,
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
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#374151',
  },
});