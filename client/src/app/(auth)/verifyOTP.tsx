import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../utils/styles';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    // After OTP verification, push into onboarding wizard
    router.push('/(onboarding)/ledgerOnboarding');
  };

  const isComplete = otp.every((d) => d.length === 1);

  return (
    <SafeAreaView style={styles.safe} >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.body, { paddingTop: spacing.xl }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#1e293b" />
          </TouchableOpacity>

          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>We sent a 4-digit code to your inbox.</Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {refs.map((ref, i) => (
              <TextInput
                key={i}
                ref={ref}
                value={otp[i]}
                onChangeText={(val) => handleChange(val, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                maxLength={1}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                style={[styles.otpBox, otp[i] ? styles.otpBoxFilled : undefined]}
              />
            ))}
          </View>

          {/* Verify button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleVerify}
            disabled={!isComplete}
            style={[styles.ctaBtn, !isComplete && styles.ctaBtnDisabled]}
          >
            <LinearGradient
              colors={['#6c47ff', '#5323e6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaLabel}>Verify & Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendBtn}>
            <Text style={styles.resendText}>
              Didn't get the code?{' '}
              <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 40,
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  otpBox: {
    flex: 1,
    height: 64,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  otpBoxFilled: {
    borderColor: '#5323e6',
    backgroundColor: '#f5f2ff',
    color: '#5323e6',
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#5323e6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  ctaBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  resendBtn: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  resendLink: {
    color: '#5323e6',
    fontWeight: '700',
  },
});
