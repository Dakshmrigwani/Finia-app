import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken } from '../store/Slices/authSlice';
import { setHasOnboarded } from '../store/Slices/appSlice';

export const useAppInit = () => {
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        const [token, onboarded] = await Promise.all([
          SecureStore.getItemAsync('auth_token'),
          AsyncStorage.getItem('has_onboarded'),
        ]);

        if (token) dispatch(setToken(token));
        if (onboarded === 'true') dispatch(setHasOnboarded(true));
      } catch (e) {
        console.error('App init failed', e);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, [dispatch]);

  return { isReady };
};
