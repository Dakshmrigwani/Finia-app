import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView ,Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { spacing } from '../../utils/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';


export default function SignupScreen() {
  const [isMarried, setIsMarried] = useState(false);
  const [agreed, setAgreed] = useState(false);
   const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" style={{paddingTop: spacing.xl}}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100">
          <Ionicons name="arrow-back" size={20} color="#1e293b" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</Text>
        <Text className="text-slate-500 mt-2 mb-8">Start your journey toward financial clarity.</Text>

        <View className="flex flex-col gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
               <Text className="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">Full Name</Text>
               <View className="h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm justify-center">
                 <TextInput placeholder="John Doe" className="text-slate-900" />
               </View>
            </View>
            <View className="flex-1">
               <Text className="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">DOB</Text>
               <View className="h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm justify-center">
                 <TextInput placeholder="DD/MM/YYYY" value={date.toDateString()}  className="text-slate-900" onPress={() => setShow(true)}   />
               </View>
               {show && (
                     <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
               )}
               
            </View>
          </View>

          <View>
            <Text className="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">Email & Phone</Text>
            <View className="flex flex-col gap-3">
              <View className="h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex-row items-center">
                <Ionicons name="mail-outline" size={18} color="#6366f1" />
                <TextInput placeholder="Email Address" className="flex-1 ml-3" />
              </View>
              <View className="h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex-row items-center">
                <Ionicons name="call-outline" size={18} color="#6366f1" />
                <TextInput placeholder="Phone Number" className="flex-1 ml-3" keyboardType="phone-pad" />
              </View>
            </View>
          </View>

          <View>
            <Text className="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">Marital Status</Text>
            <View className="flex-row bg-slate-100 p-1 rounded-2xl">
              <TouchableOpacity onPress={() => setIsMarried(false)} className={`flex-1 py-3 rounded-xl items-center ${!isMarried ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`font-bold ${!isMarried ? 'text-indigo-600' : 'text-slate-500'}`}>Single</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsMarried(true)} className={`flex-1 py-3 rounded-xl items-center ${isMarried ? 'bg-white shadow-sm' : ''}`}>
                <Text className={`font-bold ${isMarried ? 'text-indigo-600' : 'text-slate-500'}`}>Married</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">Secure Password</Text>
            <View className="h-14 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex-row items-center">
                <Ionicons name="lock-closed-outline" size={18} color="#6366f1" />
                <TextInput placeholder="••••••••" secureTextEntry className="flex-1 ml-3" />
            </View>
          </View>

          <TouchableOpacity onPress={() => setAgreed(!agreed)} className="flex-row items-center space-x-3 py-2">
            <View className={`w-5 h-5 rounded border items-center justify-center ${agreed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
              {agreed && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <Text className="text-slate-500 text-xs">I agree to the <Text className="text-indigo-600 font-bold">Terms & Privacy Policy</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 shadow-lg shadow-indigo-200"
            onPress={() => router.push('/verifyOTP')}
          >
            <LinearGradient colors={['#6366f1', '#4f46e5']} className="h-16 rounded-2xl items-center justify-center">
              <Text className="text-white font-bold text-lg">Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
