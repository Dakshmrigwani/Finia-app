import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { setToken, setUser } from '../store/Slices/authSlice';

type LoginPayload = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required.');
      }

      return {
        token: 'demo-auth-token',
        user: { email: email.trim() },
      };
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('auth_token', data.token);
      dispatch(setToken(data.token));
      dispatch(setUser(data.user));
      router.replace('/');
    },
  });
};
