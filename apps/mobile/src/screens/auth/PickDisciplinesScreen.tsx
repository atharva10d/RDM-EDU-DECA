import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@edudeca/ui';
import { progressService } from '../../services/progressService';

export const PickDisciplinesScreen = () => {
  const [selectedPath, setSelectedPath] = useState<'math' | 'bio' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fixedDisciplines = [
    { id: 'phy', name: 'Physics' },
    { id: 'che', name: 'Chemistry' },
    { id: 'ent', name: 'Entrepreneurship' },
    { id: 'eng', name: 'English' },
    { id: 'eco', name: 'Economics' },
    { id: 'log', name: 'Logical Reasoning' },
    { id: 'gk', name: 'General Knowledge' },
    { id: 'fin', name: 'Financial Literacy' },
  ];

  const handleConfirm = async () => {
    if (!selectedPath) {
      Alert.alert('Selection Required', 'Please select a path to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const pathDisciplines = selectedPath === 'math' ? ['mat', 'amat'] : ['bio', 'biotech'];
      const allDisciplines = [...fixedDisciplines.map(d => d.id), ...pathDisciplines];
      
      await progressService.saveDisciplines(allDisciplines);
      // Navigation is handled automatically by RootNavigator when state.disciplines updates
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Error', err.message || 'Failed to save disciplines. Try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Path</Text>
        <Text style={styles.subtitle}>
          The Daily Challenge consists of 10 disciplines. 8 are fixed for everyone. Choose your specialization for the last 2.
        </Text>
      </View>

      <View style={styles.fixedSection}>
        <Text style={styles.sectionTitle}>Fixed Core (8)</Text>
        <View style={styles.tagContainer}>
          {fixedDisciplines.map((d) => (
            <View key={d.id} style={styles.tag}>
              <Text style={styles.tagText}>{d.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.pathSection}>
        <Text style={styles.sectionTitle}>Select Your Specialization</Text>
        
        <TouchableOpacity 
          style={[styles.pathCard, selectedPath === 'math' && styles.pathCardSelected]} 
          onPress={() => setSelectedPath('math')}
        >
          <View style={styles.pathHeader}>
            
            <Text style={[styles.pathTitle, selectedPath === 'math' && styles.textSelected]}>Math Path</Text>
          </View>
          <Text style={styles.pathDesc}>Mathematics & Applied Mathematics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.pathCard, selectedPath === 'bio' && styles.pathCardSelected]} 
          onPress={() => setSelectedPath('bio')}
        >
          <View style={styles.pathHeader}>
            
            <Text style={[styles.pathTitle, selectedPath === 'bio' && styles.textSelected]}>Bio Path</Text>
          </View>
          <Text style={styles.pathDesc}>Biology & Biotechnology</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !selectedPath && styles.buttonDisabled]} 
          onPress={handleConfirm}
          disabled={!selectedPath || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirm Path</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  header: { marginBottom: 30, marginTop: 20 },
  title: { fontSize: 28, color: colors.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.muted, lineHeight: 22 },
  fixedSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, color: colors.text, marginBottom: 12 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  tagText: { fontSize: 14, color: colors.muted },
  pathSection: { flex: 1 },
  pathCard: { backgroundColor: colors.card, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', marginBottom: 16 },
  pathCardSelected: { borderColor: colors.teal, backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  pathHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pathTitle: { fontSize: 20, color: colors.text, marginLeft: 12 },
  textSelected: { color: colors.teal },
  pathDesc: { fontSize: 15, color: colors.muted, marginLeft: 36 },
  footer: { paddingBottom: 20 },
  button: { backgroundColor: colors.teal, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: colors.border },
  buttonText: { fontSize: 18, color: '#fff' },
});

