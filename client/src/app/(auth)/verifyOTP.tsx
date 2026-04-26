import React from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { spacing } from '../../utils/styles';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyOTPScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" >
      <View className="p-6" style={{ paddingTop: spacing.xl }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-8 w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100">
         <Ionicons name="arrow-back" size={20} color="#1e293b" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-slate-900 tracking-tight">Verify Code</Text>
        <Text className="text-slate-500 mt-2 mb-10">We sent a 4-digit code to your inbox.</Text>

        <View className="flex-row justify-between mb-10">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-16 h-16 bg-white border border-slate-200 rounded-2xl items-center justify-center shadow-sm">
              <TextInput maxLength={1} keyboardType="number-pad" className="text-2xl font-bold text-indigo-600" />
            </View>
          ))}
        </View>

        <TouchableOpacity className="mb-6 shadow-lg shadow-indigo-200">
          <LinearGradient colors={['#6366f1', '#4f46e5']} className="h-16 rounded-2xl items-center justify-center">
            <Text className="text-white font-bold text-lg">Verify & Continue</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Text className="text-slate-500 font-medium">Didn't get code? <Text className="text-indigo-600 font-bold">Resend</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
