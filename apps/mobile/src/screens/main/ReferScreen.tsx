import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, borderRadius, Card } from '@edudeca/ui';
import { ArrowLeft, Copy, Share2, Users, UserPlus } from 'lucide-react-native';
import { referralService } from '../../services';
import * as Clipboard from 'expo-clipboard';
import type { ReferralMine } from '../../services/studentLoop/mapReferralMine';
import { edudecaInviteMessage } from '../../services/studentLoop/edudecaInviteMessage';

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/KRGYkPhUWSRF89Ghp04iCb';

interface ReferScreenProps {
  navigation?: { goBack: () => void };
}

export const ReferScreen: React.FC<ReferScreenProps> = ({ navigation }) => {
  const [mine, setMine] = useState<ReferralMine>({ code: null, shareUrl: null, entries: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const loadMine = useCallback(async () => {
    try {
      const mineData = await referralService.fetchMine();
      setMine(mineData);
    } catch (_err) {
      setMine({ code: null, shareUrl: null, entries: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMine();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    const code = mine.code;
    if (!code) {
      Alert.alert('Referral', 'No referral code yet. Pull to refresh.');
      return;
    }
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Copied', code);
    } catch (_err) {
      Alert.alert('Referral code', code);
    }
  };

  const handleCopyLink = async () => {
    const url = mine.shareUrl;
    if (!url) {
      Alert.alert('Referral', 'No invite link yet. Pull to refresh.');
      return;
    }
    try {
      await Clipboard.setStringAsync(url);
      Alert.alert('Copied', url);
    } catch (_err) {
      Alert.alert('Invite link', url);
    }
  };

  const handleShare = async () => {
    const code = mine.code;
    const url = mine.shareUrl;
    if (!code || !url) {
      Alert.alert('Referral', 'No referral code yet. Pull to refresh.');
      return;
    }
    try {
      await Share.share({
        message: edudecaInviteMessage(url, code),
      });
    } catch (_err) {
      // cancelled
    }
  };

  const handleClaim = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Enter code', 'Paste a friend\'s EduDeca referral code.');
      return;
    }
    if (mine.code && code === mine.code.toUpperCase()) {
      Alert.alert('Cannot claim', 'That is your own referral code.');
      return;
    }

    setJoining(true);
    try {
      const result = await referralService.joinCommunityRoom(code);
      Alert.alert('Claimed', result.message);
      setJoinCode('');
      await loadMine();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not claim this code.';
      Alert.alert('Failed to claim', message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
          >
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Refer</Text>
        </View>
        <Text style={styles.headerSub}>
          Share your EduDeca code. Friends who sign up with it show up here.
        </Text>

        <Card style={styles.heroCard}>
          <Text style={styles.codeLabel}>YOUR CODE</Text>
          {loading && !mine.code ? (
            <ActivityIndicator color={colors.teal} style={{ marginVertical: 12 }} />
          ) : (
            <Text style={styles.codeValue} selectable>
              {mine.code ?? '—'}
            </Text>
          )}
          {mine.shareUrl ? (
            <Text style={styles.shareUrl} selectable numberOfLines={2}>
              {mine.shareUrl}
            </Text>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.actionBtn} onPress={handleCopyCode}>
              <Copy size={14} color={colors.teal} />
              <Text style={styles.actionText}>Copy code</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.actionBtn} onPress={handleCopyLink}>
              <Copy size={14} color={colors.teal} />
              <Text style={styles.actionText}>Copy link</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleShare}
            >
              <Share2 size={14} color="#062017" />
              <Text style={[styles.actionText, { color: '#062017' }]}>Refer now</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.joinCard}>
          <View style={styles.sectionHead}>
            <UserPlus size={16} color={colors.purple} />
            <Text style={styles.sectionTitle}>Have a friend's code?</Text>
          </View>
          <View style={styles.joinInputRow}>
            <TextInput
              style={styles.joinInput}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              placeholder="ED-••••••••••"
              placeholderTextColor={colors.mutedDim}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={16}
              onSubmitEditing={handleClaim}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.joinBtn, joining && { opacity: 0.6 }]}
              onPress={handleClaim}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator size="small" color="#062017" />
              ) : (
                <Text style={styles.joinBtnText}>Claim</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.listCard}>
          <View style={styles.sectionHead}>
            <Users size={16} color={colors.teal} />
            <Text style={styles.sectionTitle}>Who joined</Text>
            <Text style={styles.count}>{mine.entries.length}</Text>
          </View>
          {loading ? (
            <ActivityIndicator color={colors.teal} style={{ marginVertical: 16 }} />
          ) : mine.entries.length === 0 ? (
            <Text style={styles.empty}>
              No one has joined with your code yet.
            </Text>
          ) : (
            mine.entries.map((entry) => (
              <View key={entry.id || entry.refereeUserId} style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{entry.initials || 'S'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{entry.name || 'Student'}</Text>
                  {entry.creditedAt ? (
                    <Text style={styles.memberSub}>
                      {new Date(entry.creditedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </Card>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.waBtn}
          onPress={() => void Linking.openURL(WHATSAPP_COMMUNITY_URL)}
        >
          <Text style={styles.waBtnText}>Join WhatsApp community</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  headerSub: {
    fontSize: 13.5,
    color: colors.muted,
    marginBottom: 14,
  },
  heroCard: {
    padding: 18,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.mutedDim,
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  shareUrl: {
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareBtn: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  actionText: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  joinCard: {
    padding: 16,
    marginBottom: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  count: {
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card2,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
  },
  joinBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: '#062017',
  },
  listCard: {
    padding: 16,
    marginBottom: 12,
  },
  empty: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: '#062017',
  },
  memberName: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  memberSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  waBtn: {
    backgroundColor: '#25D366',
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  waBtnText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: '#04140b',
  },
});
