import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/themeContext';

export default function CommonLayout() {
  const router = useRouter();
  const { isDark } = useTheme();

  const TAB_BG = isDark ? '#1a1a2e' : '#ffffff';
  const BORDER_COLOR = isDark ? '#2f2e43' : '#e2e0fc';
  const TEXT_COLOR = isDark ? '#e2e0fc' : '#1e1b4b';

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: TAB_BG,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: TEXT_COLOR,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? '#3d3b54' : '#f5f2ff',
              marginLeft: 4,
              marginRight: 12,
            }}
          >
            <MaterialIcons name="arrow-back" size={20} color="#6c47ff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="notification" options={{ title: 'Notifications' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  );
}