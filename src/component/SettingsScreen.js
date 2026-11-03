
import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Linking,
  PermissionsAndroid,
  Platform,
  AppState,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import C from '../units/Colors';
import {ActionButton} from './UI';

const SETTINGS_KEY = '@todo_app_preferences';

const defaultPreferences = {
  sound: true,
  vibration: true,
};

// Reusable Setting Row - No Icons or Icon Boxes
const SettingRow = ({
  title,
  subtitle,
  onPress,
  isLast = false,
  value,
  onValueChange,
  toggle = false,
  status,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[
      styles.settingRow,
      !isLast && styles.rowDivider,
    ]}
    onPress={
      toggle
        ? () => onValueChange?.(!value)
        : onPress
    }
    disabled={disabled}
    activeOpacity={0.75}
    accessibilityRole={toggle ? 'switch' : 'button'}>

    {/* Title & Subtitle */}
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={styles.settingSubtitle}>
          {subtitle}
        </Text>
      )}
    </View>

    {/* Switch or Right Arrow */}
    {toggle ? (
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: '#D6DCE7',
          true: '#9BB0D2',
        }}
        thumbColor={value ? C.navy : '#F4F4F4'}
      />
    ) : (
      <View style={styles.rowRight}>
        {!!status && (
          <Text style={styles.permissionStatus}>
            {status}
          </Text>
        )}

        <Text style={styles.chevron}>
          ›
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const SettingsScreen = ({
  tasks = [],
  onLogout,
  onProfile,
  onNavigate,
}) => {
  const [preferences, setPreferences] = useState(
    defaultPreferences,
  );

  const [loaded, setLoaded] = useState(false);

  const [cameraGranted, setCameraGranted] =
    useState(false);

  const [
    notificationGranted,
    setNotificationGranted,
  ] = useState(false);

  const completed = tasks.filter(
    task => task.done,
  ).length;

  const pending = tasks.filter(
    task => !task.done,
  ).length;

  // Load Saved Preferences
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          SETTINGS_KEY,
        );

        if (saved && active) {
          const parsed = JSON.parse(saved);

          setPreferences({
            ...defaultPreferences,
            ...parsed,
          });
        }
      } catch (error) {
        console.log(
          'Settings load error:',
          error,
        );
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  // Save Preferences
  const updatePreference = async (key, value) => {
    if (!loaded) return;

    const updated = {
      ...preferences,
      [key]: value,
    };

    setPreferences(updated);

    try {
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.log(
        'Settings save error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save preferences.',
      );
    }
  };

  // Check Android Permissions
  const checkPermissions = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const camera = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      setCameraGranted(camera);

      if (Platform.Version >= 33) {
        const notification =
          await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS
              .POST_NOTIFICATIONS ||
              'android.permission.POST_NOTIFICATIONS',
          );

        setNotificationGranted(notification);
      } else {
        setNotificationGranted(true);
      }
    } catch (error) {
      console.log(
        'Permission check error:',
        error,
      );
    }
  };

  useEffect(() => {
    checkPermissions();

    const subscription = AppState.addEventListener(
      'change',
      state => {
        if (state === 'active') {
          checkPermissions();
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // Open System App Settings
  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open device settings.',
      );
    }
  };

  // Camera Permission
  const handleCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      await openAppSettings();
      return;
    }

    try {
      if (cameraGranted) {
        await openAppSettings();
        return;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'Allow camera access for features that use photos.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );

      if (
        result === PermissionsAndroid.RESULTS.GRANTED
      ) {
        setCameraGranted(true);

        Alert.alert(
          'Success',
          'Camera permission granted.',
        );
      } else {
        Alert.alert(
          'Camera Permission',
          'Permission was not granted. You can manage it in Android Settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: openAppSettings,
            },
          ],
        );
      }
    } catch (error) {
      console.log(
        'Camera permission error:',
        error,
      );
    }
  };

  // Notification Permission
  const handleNotificationPermission = async () => {
    if (Platform.OS !== 'android') {
      await openAppSettings();
      return;
    }

    if (Platform.Version < 33) {
      await openAppSettings();
      return;
    }

    try {
      if (notificationGranted) {
        await openAppSettings();
        return;
      }

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS
          .POST_NOTIFICATIONS ||
          'android.permission.POST_NOTIFICATIONS',
        {
          title: 'Notification Permission',
          message:
            'Allow notifications to receive task reminders.',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );

      if (
        result === PermissionsAndroid.RESULTS.GRANTED
      ) {
        setNotificationGranted(true);

        Alert.alert(
          'Success',
          'Notification permission granted.',
        );
      } else {
        Alert.alert(
          'Notification Permission',
          'You can enable notifications in Android Settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: openAppSettings,
            },
          ],
        );
      }
    } catch (error) {
      console.log(
        'Notification permission error:',
        error,
      );
    }
  };

  // Logout
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: () => onLogout?.(),
        },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.floatingBack}
          onPress={() => onNavigate?.('Home')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to Home">

          <Text style={styles.backArrow}>
            ←
          </Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Settings
          </Text>

          <Text style={styles.headerSubtitle}>
            Your account and preferences
          </Text>
        </View>
      </View>

      {/* Account */}
      <Text style={styles.sectionLabel}>
        ACCOUNT
      </Text>

      <View style={styles.card}>
        <SettingRow
          title="My Profile"
          subtitle="View and edit personal details"
          onPress={onProfile}
          isLast
        />
      </View>

      {/* App Permissions */}
      <Text style={styles.sectionLabel}>
        APP PERMISSIONS
      </Text>

      <View style={styles.card}>
        <SettingRow
          title="Camera Permission"
          subtitle="Manage access to camera"
          toggle
          value={preferences.camera}
          disabled={!loaded}
          onValueChange={value =>
            updatePreference('camera', value)
          }
          isLast
        />

        <SettingRow
          title="Notifications"
          subtitle="Manage task reminder notifications"
          toggle
          value={preferences.notification}
          disabled={!loaded}
          onValueChange={value =>
            updatePreference('notification', value)
          }
          isLast
        />
      </View>

      {/* Sound & Vibration */}
      <Text style={styles.sectionLabel}>
        SOUND & VIBRATION
      </Text>

      <View style={styles.card}>
        <SettingRow
          title="Notification Sound"
          subtitle="Save sound preference"
          toggle
          value={preferences.sound}
          disabled={!loaded}
          onValueChange={value =>
            updatePreference('sound', value)
          }
        />

        <SettingRow
          title="Vibration"
          subtitle="Save vibration preference"
          toggle
          value={preferences.vibration}
          disabled={!loaded}
          onValueChange={value =>
            updatePreference('vibration', value)
          }
          isLast
        />
      </View>

      {/* Other Settings */}
      <Text style={styles.sectionLabel}>
        OTHER SETTINGS
      </Text>

      <View style={styles.card}>
        <SettingRow
          title="System App Settings"
          subtitle="Open Android app permissions"
          onPress={openAppSettings}
        />

        <SettingRow
          title="About App"
          subtitle="TODO_APP • Productivity app"
          onPress={() =>
            Alert.alert(
              'About TODO_APP',
              'A productivity app for managing daily tasks, goals and focus sessions.',
            )
          }
          isLast
        />
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <ActionButton
          label="Log Out"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },

  floatingBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  backArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 29,
    textAlign: 'center',
    includeFontPadding: false,
    paddingBottom:10
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },

  headerSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
    lineHeight: 17,
  },

  // Section
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: C.muted,
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 10,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    overflow: 'hidden',
  },

  // Settings Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 17,
    minHeight: 74,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  settingTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },

  settingSubtitle: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
    lineHeight: 16,
  },

  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  permissionStatus: {
    fontSize: 11,
    color: C.muted,
    marginRight: 8,
  },

  chevron: {
    fontSize: 28,
    color: C.muted,
  },

  // Statistics
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 10,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: C.navy,
  },

  statLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 6,
  },

  statDivider: {
    height: 40,
    width: 1,
    backgroundColor: C.border,
  },

  logoutContainer: {
    marginTop: 14,
  },

  note: {
    fontSize: 11,
    color: C.muted,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
  },
});

export default SettingsScreen;
