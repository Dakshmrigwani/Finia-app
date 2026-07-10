import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { spacing } from '../../utils/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Logger } from '../../utils/logger';

const AI_STEPS = [
  'Building your profile',
  'Preparing AI Coach',
  'Creating Health Score',
  'Finding saving opportunities',
];

interface SignupFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isMarried: boolean;
  agreed: boolean;
  date: Date;
  showDatePicker: boolean;
  setFullName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  setPassword: (value: string) => void;
  setIsMarried: (value: boolean) => void;
  setAgreed: (value: boolean) => void;
  setShowDatePicker: (value: boolean) => void;
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
}

function useSignupForm(): SignupFormState {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isMarried, setIsMarried] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = useCallback((_event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  }, [date]);

  return {
    fullName,
    email,
    phone,
    password,
    isMarried,
    agreed,
    date,
    showDatePicker,
    setFullName,
    setEmail,
    setPhone,
    setPassword,
    setIsMarried,
    setAgreed,
    setShowDatePicker,
    onDateChange,
  };
}

interface AILoadingState {
  completedSteps: number[];
  activeStep: number;
}

function useAILoading(showLoading: boolean, onComplete: () => void): AILoadingState {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    if (!showLoading) return;

    let step = 0;
    let cancelled = false;
    let completionTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      if (cancelled) return;

      if (step < AI_STEPS.length) {
        setCompletedSteps((prev) => [...prev, step]);
        step += 1;
        setActiveStep(step);
      } else {
        clearInterval(interval);
        completionTimeout = setTimeout(() => {
          if (!cancelled) onComplete();
        }, 1000);
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (completionTimeout) clearTimeout(completionTimeout);
    };
  }, [showLoading, onComplete]);

  return { completedSteps, activeStep };
}

// ─── Reusable UI Components ────────────────────────────────────────────────────

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">
      {children}
    </Text>
  );
}

function FormField({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <View>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
    </View>
  );
}

function InputBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm justify-center ${className}`}>
      {children}
    </View>
  );
}

function InputBoxRow({ children }: { children: React.ReactNode }) {
  return (
    <View className="h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex-row items-center">
      {children}
    </View>
  );
}

interface FormTextInputProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  editable?: boolean;
}

function FormTextInput({ placeholder, value, onChangeText, secureTextEntry, keyboardType, editable }: FormTextInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      className="flex-1 text-slate-900"
      placeholderTextColor="#94a3b8"
    />
  );
}

// ─── Loading Screen Component ─────────────────────────────────────────────────

function AILoadingScreen({ completedSteps, activeStep }: AILoadingState) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-center items-center px-6">
      <View className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl items-center">
        <View className="w-16 h-16 bg-indigo-50 rounded-2xl items-center justify-center mb-6 border border-indigo-100/50">
          <ActivityIndicator size="small" color="#6366f1" />
        </View>

        <Text className="text-2xl font-extrabold text-slate-900 text-center tracking-tight mb-8">
          Finia is learning about your finances...
        </Text>

        <View className="w-full gap-4">
          {AI_STEPS.map((stepText, index) => {
            const isCompleted = completedSteps.includes(index);
            const isActive = activeStep === index;

            return (-
              <View
                key={stepText}
                className={`flex-row items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-100'
                    : isActive
                    ? 'bg-indigo-50/30 border-indigo-100'
                    : 'bg-slate-50/20 border-transparent opacity-50'
                }`}
              >
                <View className="w-6 h-6 items-center justify-center">
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                  ) : isActive ? (
                    <ActivityIndicator size="small" color="#6366f1" />
                  ) : (
                    <View className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  )}
                </View>
                <Text
                  className={`font-semibold text-[15px] ${
                    isCompleted
                      ? 'text-slate-800'
                      : isActive
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {stepText}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Signup Form ──────────────────────────────────────────────────────────────

function SignupForm({ onSubmit }: { onSubmit: () => void }) {
  const router = useRouter();
  const {
    fullName,
    email,
    phone,
    password,
    isMarried,
    agreed,
    date,
    showDatePicker,
    setFullName,
    setEmail,
    setPhone,
    setPassword,
    setIsMarried,
    setAgreed,
    setShowDatePicker,
    onDateChange,
  } = useSignupForm();

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6 w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm"
      >
        <Ionicons name="arrow-back" size={20} color="#1e293b" />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</Text>
      <Text className="text-slate-500 mt-2 mb-8">Start your journey toward financial clarity.</Text>

      <View className="flex flex-col gap-4">
        {/* Full Name & DOB */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField label="Full Name">
              <InputBox>
                <FormTextInput placeholder="John Doe" value={fullName} onChangeText={setFullName} />
              </InputBox>
            </FormField>
          </View>
          <View className="flex-1">
            <FormField label="DOB">
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <InputBox>
                  <FormTextInput placeholder="DD/MM/YYYY" value={date.toDateString()} editable={false} />
                </InputBox>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </FormField>
          </View>
        </View>

        {/* Email & Phone */}
        <FormField label="Email & Phone">
          <View className="flex flex-col gap-3">
            <InputBoxRow>
              <Ionicons name="mail-outline" size={18} color="#6366f1" />
              <FormTextInput placeholder="Email Address" keyboardType="email-address" value={email} onChangeText={setEmail} />
            </InputBoxRow>
            <InputBoxRow>
              <Ionicons name="call-outline" size={18} color="#6366f1" />
              <FormTextInput placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </InputBoxRow>
          </View>
        </FormField>

        {/* Marital Status */}
        <FormField label="Marital Status">
          <View className="flex-row bg-slate-100 p-1 rounded-2xl">
            <TouchableOpacity
              onPress={() => setIsMarried(false)}
              className={`flex-1 py-3 rounded-xl items-center ${!isMarried ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${!isMarried ? 'text-indigo-600' : 'text-slate-500'}`}>Single</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsMarried(true)}
              className={`flex-1 py-3 rounded-xl items-center ${isMarried ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${isMarried ? 'text-indigo-600' : 'text-slate-500'}`}>Married</Text>
            </TouchableOpacity>
          </View>
        </FormField>

        {/* Password */}
        <FormField label="Secure Password">
          <InputBoxRow>
            <Ionicons name="lock-closed-outline" size={18} color="#6366f1" />
            <FormTextInput placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
          </InputBoxRow>
        </FormField>

        {/* Agreement Checkbox */}
        <TouchableOpacity onPress={() => setAgreed(!agreed)} className="flex-row items-center space-x-3 py-2">
          <View
            className={`w-5 h-5 rounded border items-center justify-center ${
              agreed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
            }`}
          >
            {agreed && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text className="text-slate-500 text-xs ml-2">
            I agree to the <Text className="text-indigo-600 font-bold">Terms & Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity className="mt-4 shadow-lg shadow-indigo-200" onPress={onSubmit}>
          <LinearGradient colors={['#6366f1', '#4f46e5']} className="h-16 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-lg">Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-slate-200" />
          <Text className="mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
            Or sign up with
          </Text>
          <View className="flex-1 h-[1px] bg-slate-200" />
        </View>

        {/* Social Options */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            onPress={onSubmit}
            className="flex-1 h-14 bg-white border border-slate-100 rounded-2xl items-center justify-center flex-row shadow-sm"
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text className="ml-2 font-semibold text-slate-700">Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSubmit}
            className="flex-1 h-14 bg-white border border-slate-100 rounded-2xl items-center justify-center flex-row shadow-sm"
          >
            <Ionicons name="call-outline" size={20} color="#6366f1" />
            <Text className="ml-2 font-semibold text-slate-700">Phone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SignupScreen() {
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();

  const handleComplete = useCallback(() => {
    router.push('/verifyOTP');
  }, [router]);

  const { completedSteps, activeStep } = useAILoading(showLoading, handleComplete);

  const handleSignupSubmit = useCallback(() => {
    Logger.info('Initializing signup: configuring basic financial data, skipping bank account connection, assigning personalization financial challenge');
    setShowLoading(true);
  }, []);

  if (showLoading) {
    return <AILoadingScreen completedSteps={completedSteps} activeStep={activeStep} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: spacing.xl }}>
      <SignupForm onSubmit={handleSignupSubmit} />
    </SafeAreaView>
  );
}