import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { spacing } from '../../utils/styles';


export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: spacing.xl }}>
      <View className="p-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-8 w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100">
          <Ionicons name="arrow-back" size={20} color="#1e293b" />
        </TouchableOpacity>

        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-amber-50 rounded-full items-center justify-center">
            <Ionicons name="key-outline" size={32} color="#f59e0b" />
          </View>
          <Text className="text-2xl font-bold text-slate-900 mt-6">Forgot Password?</Text>
          <Text className="text-slate-500 mt-2 text-center">No worries! Enter your email and we will send you an OTP code.</Text>
        </View>

        <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Recovery Email</Text>
        <View className="flex-row items-center h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm mb-8">
          <Ionicons name="mail-outline" size={18} color="#6366f1" />
          <TextInput placeholder="name@email.com" className="flex-1 ml-3" />
        </View>

        <TouchableOpacity onPress={() => router.push('/verifyOTP')}>
          <LinearGradient colors={['#6366f1', '#4f46e5']} className="h-16 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-lg">Send Code</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
