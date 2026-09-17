import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Pill } from '@edudeca/ui';
import { INDIA_LOCATIONS } from '../../utils/mockData';
import { useAppStore } from '../../store/useAppStore';
import { ChevronDown, Check, AlertTriangle, Search, X, Lock } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
// Safely load GoogleSignin in environments where the native binary is present
let GoogleSignin: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = gModule.GoogleSignin;
  if (GoogleSignin?.configure) {
    GoogleSignin.configure({
      webClientId: '167530443868-kniil90rorooo9i3vu80sqmtlo3sqqi2.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }
} catch (_err) {
  // Handled gracefully in standard Expo Go
}

type SignInScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

interface SignInScreenProps {
  navigation?: any;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const storedUser = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const resetState = useAppStore((state) => state.resetState);
  const loginDevOrGuest = useAppStore((state) => state.loginDevOrGuest);
  const selectedTrack = useAppStore((state) => state.selectedTrack);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  // Form State: Pre-populate with stored details if returning
  const [fullName, setFullName] = useState<string>(
    storedUser.name && storedUser.name !== 'Whiz Student' ? storedUser.name : ''
  );
  const [email, setEmail] = useState<string>(
    storedUser.email && storedUser.email !== 'student@edudeca.in' ? storedUser.email : ''
  );
  const [classGrade, setClassGrade] = useState<'XI' | 'XII'>(
    storedUser.classGrade === 'Class 12' || storedUser.classGrade === 'XII' ? 'XII' : 'XI'
  );
  const [isScienceStream, setIsScienceStream] = useState<boolean>(
    storedUser.scienceStream ?? true
  );
  const [institution, setInstitution] = useState<string>(
    storedUser.institution || 'Viswa Vignan'
  );
  const [level4Consent, setLevel4Consent] = useState<boolean>(
    storedUser.level4Consent ?? false
  );
  const [selectedState, setSelectedState] = useState<string>(storedUser.state || '');
  const [selectedCity, setSelectedCity] = useState<string>(storedUser.city || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dropdown Modals & Search Filters
  const [showStateModal, setShowStateModal] = useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [stateSearch, setStateSearch] = useState<string>('');
  const [citySearch, setCitySearch] = useState<string>('');

  // Available States and Cities
  const allStates = useMemo(() => Object.keys(INDIA_LOCATIONS).sort(), []);
  const allCities = useMemo(
    () => (selectedState ? (INDIA_LOCATIONS[selectedState] || []).slice().sort() : []),
    [selectedState]
  );

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return allStates;
    const q = stateSearch.toLowerCase();
    return allStates.filter((s) => s.toLowerCase().includes(q));
  }, [allStates, stateSearch]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return allCities;
    const q = citySearch.toLowerCase();
    return allCities.filter((c) => c.toLowerCase().includes(q));
  }, [allCities, citySearch]);

  // Validation: require full name, science stream, institution, state, city, and level4 consent
  const isValid =
    fullName.trim().length > 0 &&
    isScienceStream &&
    institution.trim().length > 0 &&
    selectedState !== '' &&
    selectedCity !== '' &&
    level4Consent;

  const handleStateSelect = (st: string) => {
    setSelectedState(st);
    setSelectedCity('');
    setStateSearch('');
    setShowStateModal(false);
  };

  const handleCitySelect = (ct: string) => {
    setSelectedCity(ct);
    setCitySearch('');
    setShowCityModal(false);
  };

  // Handle deep link redirect after Google OAuth & sync existing Google session
  useEffect(() => {
    // 1. Sync any existing session from Supabase on mount
    supabase.auth.getSession().then(({ data }) => {
      const s = data?.session;
      if (s?.user) {
        if (s.user.email) {
          setEmail(s.user.email);
        }
        const gName = s.user.user_metadata?.full_name || s.user.user_metadata?.name;
        if (gName && (!fullName || fullName === 'Whiz Student')) {
          setFullName(gName);
        }
        setUser({
          id: s.user.id,
          ...(s.user.email ? { email: s.user.email } : {}),
          ...(gName ? { name: gName } : {}),
        });
      }
    });

    // 2. Listen for auth state changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        if (s.user.email) {
          setEmail(s.user.email);
        }
        const gName = s.user.user_metadata?.full_name || s.user.user_metadata?.name;
        if (gName && (!fullName || fullName === 'Whiz Student')) {
          setFullName(gName);
        }
        setUser({
          id: s.user.id,
          ...(s.user.email ? { email: s.user.email } : {}),
          ...(gName ? { name: gName } : {}),
        });
      }
    });

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url) {
        // Extract tokens from URL fragment (Supabase sends them as hash params)
        const params = new URLSearchParams(url.split('#')[1] || '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[Supabase Auth] Session set error:', error.message);
          }
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    const gradeLabel = classGrade === 'XI' ? 'Class 11' : 'Class 12';
    const classLevel = classGrade === 'XI' ? 11 : 12; // Integer for Supabase
    let studentName = fullName.trim() || storedUser.name || 'Whiz Student';
    let studentEmail = email.trim().toLowerCase() || storedUser.email;
    let session = null;

    try {
      // 1. Native Google popup appears (no browser / no website)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response: any = await GoogleSignin.signIn();

      // Extract the dynamic idToken
      const idToken = response.data?.idToken || response.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');

      // 2. Token is sent directly to Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      session = data.session;
      console.log('Login successful! Supabase session:', data.session);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setIsSubmitting(false);

      if (err?.code === 'SIGN_IN_CANCELLED' || err?.code === '12501') {
        return;
      }

      Alert.alert(
        'Google Sign-In',
        err?.message?.includes('null')
          ? 'True Native Sign-In requires an Android Development Build or APK to display the native account selector sheet without opening a browser.'
          : err?.message || 'Native Google Sign-In failed.'
      );
      return;
    }

    try {
      // Refresh or check session
      if (!session) {
        const { data: sessionData } = await supabase.auth.getSession();
        session = sessionData.session;
      }

      if (session?.user) {
        studentName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || studentName;
        studentEmail = session.user.email || studentEmail;
        setEmail(studentEmail);
        setFullName(studentName);

        // Upsert to edudeca_profiles with class_level as integer
        const { error: upsertError } = await supabase
          .from('edudeca_profiles')
          .upsert(
            {
              id: session.user.id,
              full_name: studentName,
              email: studentEmail,
              class_level: classLevel,
              institution: institution.trim(),
              state: selectedState,
              city: selectedCity,
            },
            { onConflict: 'id' }
          );

        if (upsertError) {
          console.log('[Supabase] Profile upsert notice:', upsertError.message);
        }
      }
    } catch (err: any) {
      console.log('[Supabase Sync Notice]:', err?.message || err);
    } finally {
      const profileData = {
        name: studentName,
        email: studentEmail,
        classGrade: gradeLabel,
        scienceStream: isScienceStream,
        institution: institution.trim(),
        state: selectedState,
        city: selectedCity,
        level4Consent,
        selectedTrack: selectedTrack || 'A',
        level: storedUser.level || 0,
        streak: storedUser.streak || 0,
        rdmBalance: storedUser.rdmBalance || 0,
        quizzesCompleted: storedUser.quizzesCompleted || 0,
      };

      // 1. Immediately authenticate and save to local Zustand store
      setUser(profileData);
      loginDevOrGuest(profileData);

      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Pills Row */}
        <View style={styles.pillRow}>
          <Pill label="Join free" variant="teal" />
          <Pill label="Go viral" variant="blue" />
          <Pill label="Level up" variant="purple" />
          <Pill label="Go national" variant="dim" />
          <Pill label="Pick path" variant="dim" />
          <Pill label="Sign in" variant="teal" style={{ backgroundColor: 'rgba(34,211,166,0.12)' }} />
        </View>

        {/* Final Step Badge & Header */}
        <View style={styles.finalBadge}>
          <Text style={styles.finalBadgeText}>🏁 FINAL STEP · SIGN IN</Text>
        </View>

        <Text style={styles.whizLine}>
          🏆 Continue your journey to become a chosen Whiz360
        </Text>

        <Text style={styles.signInH1}>Start Today …</Text>
        <Text style={styles.signInSub}>
          Enter your details and continue with Google to join EduDeca.
        </Text>

        {/* 1-Tap Direct Login for Returning Users */}
        {storedUser.institution ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.returningCard}
            onPress={() => {
              loginDevOrGuest(storedUser);
            }}
          >
            <View style={styles.returningLeft}>
              <Text style={styles.returningTitle}>👋 Welcome Back, {storedUser.name || 'Champion'}!</Text>
              <Text style={styles.returningSub} numberOfLines={1}>
                {storedUser.classGrade} · {storedUser.institution}
              </Text>
            </View>
            <View style={styles.returningBtn}>
              <Text style={styles.returningBtnText}>Direct Login →</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Field 0: Full Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Your Full Name</Text>
          <TextInput
            style={styles.txtInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor={colors.mutedDim}
            autoCapitalize="words"
          />
        </View>

        {/* Field 0.5: Google Account Email (Auto-Linked from Google Sign-In) */}
        <View style={styles.field}>
          <View style={styles.emailHeaderRow}>
            <Text style={styles.fieldLabel}>Google Account Email</Text>
            <View style={styles.lockedChip}>
              <Lock size={9} color={colors.gold} />
              <Text style={styles.lockedText}>LOCKED TO GOOGLE</Text>
            </View>
          </View>

          <View style={styles.lockedEmailBox}>
            <Svg width={16} height={16} viewBox="0 0 48 48">
              <Path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <Path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <Path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <Path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </Svg>
            <Text
              style={[
                styles.lockedEmailText,
                !(email || storedUser.email) && styles.lockedEmailPlaceholder,
              ]}
              numberOfLines={1}
            >
              {email || storedUser.email || 'Will link automatically from your Google account'}
            </Text>
            {Boolean(email || storedUser.email) && (
              <Check size={14} color={colors.teal} />
            )}
          </View>
          <Text style={styles.fieldHint}>
            Only the official email authenticated via Google Sign-In is registered to your EduDeca ID.
          </Text>
        </View>

        {/* Field 1: Class Selection */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Which class are you in?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                classGrade === 'XI' && styles.toggleBtnSelected,
              ]}
              onPress={() => setClassGrade('XI')}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  classGrade === 'XI' && styles.toggleBtnTextSelected,
                ]}
              >
                Class 11
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                classGrade === 'XII' && styles.toggleBtnSelected,
              ]}
              onPress={() => setClassGrade('XII')}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  classGrade === 'XII' && styles.toggleBtnTextSelected,
                ]}
              >
                Class 12
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Field 2: Science Stream Validation */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Are you in the Science Stream?</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                isScienceStream && styles.toggleBtnSelected,
              ]}
              onPress={() => setIsScienceStream(true)}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  isScienceStream && styles.toggleBtnTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                !isScienceStream && styles.toggleBtnSelectedNo,
              ]}
              onPress={() => setIsScienceStream(false)}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  !isScienceStream && styles.toggleBtnTextSelectedNo,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          {!isScienceStream && (
            <View style={styles.streamWarn}>
              <AlertTriangle size={14} color="#FFAFA0" />
              <Text style={styles.streamWarnText}>
                ⚠️ Only for Science Stream students.
              </Text>
            </View>
          )}
        </View>

        {/* Field 3: Institution Input & Level-4 Consent */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>My College / School / Institution</Text>
          <TextInput
            style={styles.txtInput}
            value={institution}
            onChangeText={setInstitution}
            placeholder="e.g. Viswa Vignan"
            placeholderTextColor={colors.mutedDim}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.chkRow, level4Consent && styles.chkRowChecked]}
            onPress={() => setLevel4Consent(!level4Consent)}
          >
            <View style={[styles.chkBox, level4Consent && styles.chkBoxChecked]}>
              {level4Consent && <Check size={12} color="#04140E" strokeWidth={3.5} />}
            </View>
            <Text style={styles.chkLabel}>
              I understand I need approval &amp; support from my Institution from{' '}
              <Text style={{ color: colors.text, fontWeight: '700' }}>Level-4</Text> onwards.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Field 4: Location Dropdowns */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Your Location (within India)</Text>
          <View style={styles.locGrid}>
            {/* State Selector */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.selInput}
              onPress={() => {
                setStateSearch('');
                setShowStateModal(true);
              }}
            >
              <Text
                style={[
                  styles.selInputText,
                  !selectedState && { color: colors.mutedDim },
                ]}
                numberOfLines={1}
              >
                {selectedState || 'State / UT'}
              </Text>
              <ChevronDown size={16} color={colors.muted} />
            </TouchableOpacity>

            {/* City Selector */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.selInput, !selectedState && styles.selInputDisabled]}
              disabled={!selectedState}
              onPress={() => {
                setCitySearch('');
                setShowCityModal(true);
              }}
            >
              <Text
                style={[
                  styles.selInputText,
                  !selectedCity && { color: colors.mutedDim },
                ]}
                numberOfLines={1}
              >
                {selectedCity || 'City / District'}
              </Text>
              <ChevronDown size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Google OAuth Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!isValid || isSubmitting}
          style={[
            styles.googleBtn,
            (!isValid || isSubmitting) && styles.googleBtnDisabled,
          ]}
          onPress={handleGoogleSignIn}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#1F2430" />
          ) : (
            <Svg width={18} height={18} viewBox="0 0 48 48">
              <Path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <Path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <Path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <Path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </Svg>
          )}
          <Text style={styles.googleBtnText}>
            {isSubmitting ? 'Connecting Google...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {/* Bottom Indicator Dots */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
      </ScrollView>

      {/* State / UT Picker Modal */}
      <Modal visible={showStateModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select State / Union Territory</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBox}>
              <Search size={16} color={colors.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search 28 States & 8 UTs..."
                placeholderTextColor={colors.mutedDim}
                value={stateSearch}
                onChangeText={setStateSearch}
                autoCorrect={false}
              />
              {stateSearch.length > 0 && (
                <TouchableOpacity onPress={() => setStateSearch('')}>
                  <X size={16} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleStateSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {selectedState === item && (
                    <Check size={18} color={colors.teal} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No matching state or UT found.</Text>
              }
            />
            <Button
              title="Close"
              variant="outline"
              onPress={() => setShowStateModal(false)}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>

      {/* City / District Picker Modal */}
      <Modal visible={showCityModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                Select District · {selectedState}
              </Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBox}>
              <Search size={16} color={colors.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search districts in ${selectedState}...`}
                placeholderTextColor={colors.mutedDim}
                value={citySearch}
                onChangeText={setCitySearch}
                autoCorrect={false}
              />
              {citySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCitySearch('')}>
                  <X size={16} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {selectedCity === item && (
                    <Check size={18} color={colors.teal} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No matching district found.</Text>
              }
            />
            <Button
              title="Close"
              variant="outline"
              onPress={() => setShowCityModal(false)}
              style={{ marginTop: 10 }}
            />
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
    paddingBottom: 40,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  finalBadge: {
    alignSelf: 'center',
    backgroundColor: colors.tealAlpha10,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.round,
    marginBottom: 12,
  },
  finalBadgeText: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  whizLine: {
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
    marginBottom: 18,
  },
  signInH1: {
    textAlign: 'center',
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 6,
  },
  signInSub: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12.5,
    marginBottom: 20,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 9,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 9,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  toggleBtnSelected: {
    backgroundColor: colors.tealDeep,
    borderColor: colors.teal,
  },
  toggleBtnSelectedNo: {
    backgroundColor: '#2A1416',
    borderColor: colors.red,
  },
  toggleBtnText: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  toggleBtnTextSelected: {
    color: '#FFFFFF',
  },
  toggleBtnTextSelectedNo: {
    color: '#FFAFA0',
  },
  streamWarn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: colors.redAlpha10,
    borderWidth: 1,
    borderColor: colors.redAlpha40,
  },
  streamWarnText: {
    color: '#FFAFA0',
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
  },
  txtInput: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.text,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 11,
    fontSize: 13.5,
  },
  chkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chkRowChecked: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  chkBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  chkBoxChecked: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  chkLabel: {
    flex: 1,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },
  locGrid: {
    flexDirection: 'row',
    gap: 9,
  },
  selInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 11,
  },
  selInputDisabled: {
    opacity: 0.5,
  },
  selInputText: {
    fontSize: 13.5,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 15,
    marginTop: 6,
  },
  googleBtnDisabled: {
    opacity: 0.45,
  },
  googleBtnText: {
    fontSize: 14.5,
    fontWeight: typography.fontWeight.bold,
    color: '#1F2430',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 22,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    borderRadius: 5,
    backgroundColor: colors.teal,
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
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13.5,
    padding: 0,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 14,
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.mutedDim,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lockedEmailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  lockedEmailText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  lockedEmailPlaceholder: {
    color: colors.mutedDim,
    fontStyle: 'italic',
    fontWeight: typography.fontWeight.regular,
  },
  fieldHint: {
    fontSize: 10.5,
    color: colors.mutedDim,
    marginTop: 5,
    lineHeight: 14,
  },
  lockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(240, 180, 41, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(240, 180, 41, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedText: {
    fontSize: 8.5,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  returningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.tealAlpha10,
    borderWidth: 1.5,
    borderColor: colors.tealAlpha35,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  returningLeft: {
    flex: 1,
    marginRight: 10,
  },
  returningTitle: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginBottom: 3,
  },
  returningSub: {
    fontSize: 11.5,
    color: colors.muted,
  },
  returningBtn: {
    backgroundColor: colors.teal,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  returningBtnText: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.bold,
    color: '#04140E',
  },
});
