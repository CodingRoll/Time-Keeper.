import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, FileText, Info, Download, ArrowRight } from 'lucide-react-native';

const features = [
  {
    id: 'time-calculation',
    title: 'Time Calculation',
    subtitle: 'Calculate working hours, breaks, and overtime',
    icon: Clock,
    color: '#3B82F6',
    route: '/time-calculation',
  },
  {
    id: 'records',
    title: 'Records',
    subtitle: 'Manage and view your time records',
    icon: FileText,
    color: '#14B8A6',
    route: '/records',
  },
  {
    id: 'information',
    title: 'Information',
    subtitle: 'View detailed information and statistics',
    icon: Info,
    color: '#8B5CF6',
    route: '/information',
  },
  {
    id: 'export',
    title: 'Export',
    subtitle: 'Export your data in various formats',
    icon: Download,
    color: '#F97316',
    route: '/export',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  const handleFeaturePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.subtitleText}>Choose a feature to get started</Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, { borderLeftColor: feature.color }]}
                onPress={() => handleFeaturePress(feature.route)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${feature.color}15` }]}>
                    <IconComponent size={32} color={feature.color} strokeWidth={2} />
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                  </View>

                  <View style={styles.arrowContainer}>
                    <ArrowRight size={20} color="#9CA3AF" strokeWidth={2} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
    marginBottom: 32,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  arrowContainer: {
    padding: 4,
  },
});