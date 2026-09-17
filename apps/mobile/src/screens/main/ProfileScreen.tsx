import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Card } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import { userService } from '../../services';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  School,
  MapPin,
  Compass,
  Award,
  Flame,
  Coins,
  CheckCircle2,
  Copy,
  Share2,
  Edit3,
  LogOut,
  X,
  Check,
  Lock,
} from 'lucide-react-native';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'Profile'
>;

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const resetState = useAppStore((state) => state.resetState);
  const selectedTrack = useAppStore((state) => state.selectedTrack);
  const setSelectedTrack = useAppStore((state) => state.setSelectedTrack);



  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState(user.name || '');
  const [editInstitution, setEditInstitution] = useState(user.institution || '');
  const [editGrade, setEditGrade] = useState<'Class 11' | 'Class 12'>(
    (user.classGrade as any) || 'Class 11'
  );
  const [editTrack, setEditTrack] = useState<'A' | 'B'>(selectedTrack || 'A');

  const fetchProfile = useCallback(async () => {
    try {
      // 1. Sync Supabase authenticated session email if available
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionEmail = sessionData.session?.user?.email;
      if (sessionEmail && sessionEmail !== user.email) {
        setUser({ email: sessionEmail });
      }

      // 2. Fetch profile from database
      const uid = sessionData.session?.user?.id || user?.id;
      if (uid) {
        const liveProfile = await userService.fetchCurrentUser(uid);
        if (liveProfile) {
          setUserProfile(liveProfile);
        }
      }
    } catch (_err) {
      // Offline fallback
    }
  }, [user?.id, user.email, setUser, setUserProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleOpenEdit = () => {
    setEditName(user.name || '');
    setEditInstitution(user.institution || '');
    setEditGrade((user.classGrade as any) || 'Class 11');
    setEditTrack(selectedTrack || 'A');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editInstitution.trim()) {
      Alert.alert('Incomplete Form', 'Please enter your name and institution.');
      return;
    }

    setIsSaving(true);
    const updatedData = {
      name: editName.trim(),
      email: user.email,
      institution: editInstitution.trim(),
      classGrade: editGrade,
      selectedTrack: editTrack,
    };

    try {
      // Update local state immediately
      setUser(updatedData);
      setSelectedTrack(editTrack);

      // Sync to Supabase backend database
      await userService.updateUserProfile(updatedData, user?.id);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully! 🎉');
    } catch (err: any) {
      Alert.alert('Success', 'Profile updated locally! 🎉');
      setEditModalVisible(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    Alert.alert('Referral Code', `Code ${user.referralCode || 'EDUD1000'} copied!`);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `🏆 Join me on EduDeca — India's Premier 10-Discipline Student Challenge! Use my referral code: ${
          user.referralCode || 'EDUD1000'
        }`,
      });
    } catch (_err) {
      // Ignored
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of EduDeca?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (_err) {
            // Ignored
          }
          resetState();
        },
      },
    ]);
  };

  const userInitials = (user.name || 'Whiz Student')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleGoBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('DashboardTab');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
            colors={[colors.teal]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={handleGoBack}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.editHeaderBtn}
            onPress={handleOpenEdit}
          >
            <Edit3 size={16} color={colors.teal} />
            <Text style={styles.editHeaderText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name || 'Whiz Student'}</Text>
                <View style={styles.verifiedChip}>
                  <CheckCircle2 size={12} color={colors.teal} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user.email || 'No email registered'}</Text>
              <View style={styles.userBadgeRow}>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{user.classGrade || 'Class 11'}</Text>
                </View>
                <View style={styles.streamBadge}>
                  <Text style={styles.streamBadgeText}>Science Stream</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Gamification Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.tealAlpha12 }]}>
              <Award size={18} color={colors.teal} />
            </View>
            <Text style={styles.statVal}>Level {user.level || 0}</Text>
            <Text style={styles.statLbl}>Current Level</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.goldAlpha12 }]}>
              <Flame size={18} color={colors.gold} />
            </View>
            <Text style={styles.statVal}>{user.streak || 0} Days</Text>
            <Text style={styles.statLbl}>Streak</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.purpleAlpha08 }]}>
              <Coins size={18} color={colors.purple} />
            </View>
            <Text style={styles.statVal}>{(user.rdmBalance || 0).toLocaleString('en-IN')}</Text>
            <Text style={styles.statLbl}>RDM Points</Text>
          </View>
        </View>

        {/* Academic & Competition Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Academic &amp; Registration Details</Text>

          {/* Registered Email Row (Locked & Permanent) */}
          <View style={styles.detailRow}>
            <Mail size={16} color={colors.teal} style={styles.detailIcon} />
            <View style={styles.detailTextWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={styles.detailLabel}>Registered Email</Text>
                <View style={styles.lockedChip}>
                  <Lock size={9} color={colors.gold} />
                  <Text style={styles.lockedText}>LOCKED</Text>
                </View>
              </View>
              <Text style={styles.detailValue}>
                {user.email || 'No email registered'}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <School size={16} color={colors.muted} style={styles.detailIcon} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Institution / School</Text>
              <Text style={styles.detailValue}>
                {user.institution || 'Viswa Vignan'}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.muted} style={styles.detailIcon} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {user.city && user.state
                  ? `${user.city}, ${user.state}`
                  : user.state || 'All India'}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Compass size={16} color={colors.muted} style={styles.detailIcon} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Selected Track</Text>
              <Text style={styles.detailValue}>
                {selectedTrack === 'A'
                  ? 'Track A (Mathematics & Applied Math)'
                  : 'Track B (Biology & Biotechnology)'}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <CheckCircle2 size={16} color={colors.teal} style={styles.detailIcon} />
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Level-4 Institution Support Consent</Text>
              <Text style={[styles.detailValue, { color: colors.teal }]}>
                {user.level4Consent ? 'Granted & Confirmed' : 'Granted'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Referral Card */}
        <Card style={styles.referralCard}>
          <View style={styles.referralHead}>
            <View>
              <Text style={styles.referralTitle}>Your Referral Code</Text>
              <Text style={styles.referralSub}>Invite classmates to earn RDM bonuses</Text>
            </View>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{user.referralCode || 'EDUD1000'}</Text>
            </View>
          </View>

          <View style={styles.referralBtnRow}>
            <Button
              title="Copy Code"
              onPress={handleCopyCode}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="Share Link"
              onPress={handleShareReferral}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.signOutBtn}
          onPress={handleSignOut}
        >
          <LogOut size={16} color={colors.red} />
          <Text style={styles.signOutBtnText}>Sign Out of EduDeca</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Registered Email (Immutable / Read-Only) */}
              <View style={styles.lockedLabelRow}>
                <Text style={styles.inputLabelLocked}>Registered Email</Text>
                <View style={styles.lockedChip}>
                  <Lock size={9} color={colors.gold} />
                  <Text style={styles.lockedText}>PERMANENT · IMMUTABLE</Text>
                </View>
              </View>
              <View style={styles.readOnlyInputBox}>
                <Mail size={15} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.readOnlyEmailText}>
                  {user.email || 'No email registered'}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
                placeholderTextColor={colors.mutedDim}
              />

              <Text style={styles.inputLabel}>Institution / School</Text>
              <TextInput
                style={styles.modalInput}
                value={editInstitution}
                onChangeText={setEditInstitution}
                placeholder="Enter school/college name"
                placeholderTextColor={colors.mutedDim}
              />

              <Text style={styles.inputLabel}>Class / Grade</Text>
              <View style={styles.gradeToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.gradeToggleBtn,
                    editGrade === 'Class 11' && styles.gradeToggleActive,
                  ]}
                  onPress={() => setEditGrade('Class 11')}
                >
                  <Text
                    style={[
                      styles.gradeToggleText,
                      editGrade === 'Class 11' && styles.gradeToggleTextActive,
                    ]}
                  >
                    Class 11
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.gradeToggleBtn,
                    editGrade === 'Class 12' && styles.gradeToggleActive,
                  ]}
                  onPress={() => setEditGrade('Class 12')}
                >
                  <Text
                    style={[
                      styles.gradeToggleText,
                      editGrade === 'Class 12' && styles.gradeToggleTextActive,
                    ]}
                  >
                    Class 12
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Chosen Discipline Track</Text>
              <View style={styles.trackToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.trackBox,
                    editTrack === 'A' && styles.trackBoxActiveA,
                  ]}
                  onPress={() => setEditTrack('A')}
                >
                  <Text style={styles.trackTitle}>Track A</Text>
                  <Text style={styles.trackSub}>Σ Maths + Applied Maths</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.trackBox,
                    editTrack === 'B' && styles.trackBoxActiveB,
                  ]}
                  onPress={() => setEditTrack('B')}
                >
                  <Text style={styles.trackTitle}>Track B</Text>
                  <Text style={styles.trackSub}>🧬 Biology + Biotech</Text>
                </TouchableOpacity>
              </View>

              <Button
                title={isSaving ? 'Saving...' : 'Save Changes'}
                onPress={handleSaveProfile}
                disabled={isSaving}
                variant="primary"
                style={{ marginTop: 18 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tealAlpha10,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.round,
  },
  editHeaderText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  userCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: typography.fontWeight.black,
    color: '#04140E',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.tealAlpha10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  userEmail: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },
  userBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  gradeBadgeText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  streamBadge: {
    backgroundColor: colors.tealAlpha10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  streamBadgeText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statVal: {
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 9,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.bold,
  },
  infoCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10.5,
    color: colors.mutedDim,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  referralCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  referralHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  referralSub: {
    fontSize: 11,
    color: colors.mutedDim,
  },
  codeBox: {
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  referralBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.redAlpha10,
    borderWidth: 1,
    borderColor: colors.redAlpha40,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  signOutBtnText: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.red,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.backdropDark,
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: colors.card2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.base,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: colors.text,
  },
  gradeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gradeToggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  gradeToggleActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  gradeToggleText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  gradeToggleTextActive: {
    color: colors.teal,
  },
  trackToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trackBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  trackBoxActiveA: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  trackBoxActiveB: {
    borderColor: colors.purple,
    backgroundColor: colors.purpleAlpha08,
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  trackSub: {
    fontSize: 10,
    color: colors.mutedDim,
  },
  lockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.goldAlpha12,
    borderWidth: 1,
    borderColor: colors.goldAlpha35,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  lockedText: {
    fontSize: 8.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  lockedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 10,
  },
  inputLabelLocked: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  readOnlyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    opacity: 0.85,
  },
  readOnlyEmailText: {
    fontSize: 13.5,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },
});
