import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePermissionsContext } from '../context/permissionsContext';

const PERMISSIONS_CARD_DISMISSED_KEY = 'finia_permissions_card_dismissed';

interface PermissionsOptionCardProps {
  compact?: boolean;
}

export function PermissionsOptionCard({ compact = false }: PermissionsOptionCardProps) {
  const {
    contacts,
    sms,
    requestContacts,
    requestSMS,
    checkStatuses,
  } = usePermissionsContext();

  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);
  // Local per-button loading — NOT shared with context
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingSms, setLoadingSms] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PERMISSIONS_CARD_DISMISSED_KEY).then((val) => {
      setIsDismissed(val === 'true');
    });
  }, []);

  const isAllGranted = contacts === 'granted' && sms === 'granted';

  // Auto-hide when all permissions become granted
  if (isAllGranted || isDismissed === true || isDismissed === null) {
    return null;
  }

  const handleDismiss = async () => {
    setIsDismissed(true);
    await AsyncStorage.setItem(PERMISSIONS_CARD_DISMISSED_KEY, 'true');
  };

  // "Allow" button requests only the missing permissions
  const handlePressAll = async () => {
    setLoadingAll(true);
    try {
      if (contacts !== 'granted') await requestContacts();
      if (sms !== 'granted') await requestSMS();
      await checkStatuses();
    } finally {
      setLoadingAll(false);
    }
  };

  const handlePressContacts = async () => {
    setLoadingContacts(true);
    try {
      await requestContacts();
      await checkStatuses();
    } finally {
      setLoadingContacts(false);
    }
  };

  const handlePressSms = async () => {
    setLoadingSms(true);
    try {
      await requestSMS();
      await checkStatuses();
    } finally {
      setLoadingSms(false);
    }
  };

  return (
    <View className="mb-5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-10 h-10 rounded-xl bg-indigo-50 items-center justify-center mr-3">
            <Ionicons name="shield-checkmark-outline" size={22} color="#6366f1" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 font-bold text-sm">
              Device Sync Permissions
            </Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Sync contacts & auto-detect transactions
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={handlePressAll}
            disabled={loadingAll}
            activeOpacity={0.8}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 flex-row items-center"
          >
            {loadingAll ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-xs">Allow</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
          >
            <Ionicons name="close" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status pills — tap each pill to grant that specific permission */}
      <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-50">
        <TouchableOpacity
          onPress={handlePressContacts}
          disabled={contacts === 'granted' || loadingContacts}
          className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
            contacts === 'granted'
              ? 'bg-emerald-50/60 border-emerald-100'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {loadingContacts ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Ionicons
              name={contacts === 'granted' ? 'checkmark-circle' : 'person-outline'}
              size={13}
              color={contacts === 'granted' ? '#059669' : '#64748b'}
            />
          )}
          <Text
            className={`text-[11px] font-medium ml-1.5 ${
              contacts === 'granted' ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            Contacts {contacts === 'granted' ? '✓' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePressSms}
          disabled={sms === 'granted' || loadingSms}
          className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
            sms === 'granted'
              ? 'bg-emerald-50/60 border-emerald-100'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {loadingSms ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Ionicons
              name={sms === 'granted' ? 'checkmark-circle' : 'chatbox-ellipses-outline'}
              size={13}
              color={sms === 'granted' ? '#059669' : '#64748b'}
            />
          )}
          <Text
            className={`text-[11px] font-medium ml-1.5 ${
              sms === 'granted' ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            SMS {sms === 'granted' ? '✓' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
