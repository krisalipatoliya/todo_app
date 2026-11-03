
import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

import C from '../units/Colors';
import {Card, ActionButton} from './UI';

const PROFILE_KEY = '@todo_app_user_profile';

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  dailyGoal: '5',
  photo: '',
};

const ProfileScreen = ({
  onBack,
  tasks = [],
  user,
  onProfileUpdate,
}) => {
  const [profile, setProfile] = useState({
    ...defaultProfile,
    name: user?.name || '',
    email: user?.email || '',
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          PROFILE_KEY,
        );

        if (!active) return;

        if (saved) {
          const savedProfile = JSON.parse(saved);

          const sameUser =
            !user?.email ||
            !savedProfile.email ||
            savedProfile.email.toLowerCase() ===
              user.email.toLowerCase();

          if (sameUser) {
            setProfile({
              ...defaultProfile,
              ...savedProfile,
              name:
                user?.name ||
                savedProfile.name ||
                '',
              email:
                user?.email ||
                savedProfile.email ||
                '',
            });
          } else {
            setProfile({
              ...defaultProfile,
              name: user?.name || '',
              email: user?.email || '',
            });

            setEditing(true);
          }
        } else {
          setProfile({
            ...defaultProfile,
            name: user?.name || '',
            email: user?.email || '',
          });

          setEditing(true);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            'Error',
            'Unable to load profile.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.email]);

  // Update field
  const updateField = (field, value) => {
    setProfile(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  // Save profile
  const saveProfile = async () => {
    const updatedProfile = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    };

    if (!updatedProfile.name) {
      Alert.alert(
        'Required',
        'Please enter your name.',
      );
      return;
    }

    if (
      updatedProfile.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        updatedProfile.email,
      )
    ) {
      Alert.alert(
        'Invalid Email',
        'Enter a valid email.',
      );
      return;
    }

    if (
      updatedProfile.phone &&
      !/^\+?[\d\s-]{7,18}$/.test(
        updatedProfile.phone,
      )
    ) {
      Alert.alert(
        'Invalid Phone',
        'Enter a valid phone number.',
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(updatedProfile.dailyGoal),
      ) ||
      Number(updatedProfile.dailyGoal) < 1
    ) {
      Alert.alert(
        'Invalid Goal',
        'Enter a positive daily goal.',
      );
      return;
    }

    try {
      await AsyncStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(updatedProfile),
      );

      setProfile(updatedProfile);

      onProfileUpdate?.(updatedProfile);

      setEditing(false);

      Alert.alert(
        'Success',
        'Profile updated successfully!',
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to save profile.',
      );
    }
  };

  // Select profile photo
  const selectPhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert(
          'Photo Error',
          result.errorMessage ||
            'Unable to select photo.',
        );
        return;
      }

      const uri = result.assets?.[0]?.uri;

      if (uri) {
        updateField('photo', uri);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to select photo.',
      );
    }
  };

  // Statistics
  const completed = tasks.filter(
    task => task.done,
  ).length;

  const pending = tasks.filter(
    task => !task.done,
  ).length;

  const today = new Date();

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const todayCompleted = tasks.filter(
    task =>
      task.done &&
      task.date === todayKey,
  ).length;

  const dailyTarget =
    Number(profile.dailyGoal) || 5;

  const progress = Math.min(
    100,
    (todayCompleted / dailyTarget) * 100,
  );

  const initials = profile.name
    ? profile.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word =>
          word.charAt(0).toUpperCase(),
        )
        .join('')
    : '👤';

  // Reusable input
  const renderField = (
    label,
    field,
    placeholder,
    keyboardType = 'default',
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      {editing ? (
        <TextInput
          style={styles.input}
          value={profile[field]}
          onChangeText={value =>
            updateField(field, value)
          }
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          keyboardType={keyboardType}
          autoCapitalize={
            field === 'email'
              ? 'none'
              : 'sentences'
          }
        />
      ) : (
        <Text style={styles.value}>
          {profile[field] || 'Not added'}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.subtitle}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Circular Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.floatingBack}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Go Back">

          <Text style={styles.backArrow}>
            ←
          </Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            My Profile
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your personal information
          </Text>
        </View>
      </View>

      {/* Profile Card */}
      <Card>
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={selectPhoto}
            activeOpacity={0.8}>

            {profile.photo ? (
              <Image
                source={{
                  uri: profile.photo,
                }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.initials}>
                {initials}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={selectPhoto}>

            <Text style={styles.changePhoto}>
              Change Profile Photo
            </Text>
          </TouchableOpacity>

          <Text style={styles.profileName}>
            {profile.name || 'Your Name'}
          </Text>

          <Text style={styles.subtitle}>
            {profile.email ||
              'Add your email address'}
          </Text>

          {!editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                setEditing(true)
              }>

              <Text style={styles.editText}>
                ✎ Edit Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Personal Details */}
      <Text style={styles.heading}>
        Personal Details
      </Text>

      <Card>
        {renderField(
          'Full Name',
          'name',
          'Enter full name',
        )}

        {renderField(
          'Email Address',
          'email',
          'Enter email address',
          'email-address',
        )}

        {renderField(
          'Phone Number',
          'phone',
          'Enter phone number',
          'phone-pad',
        )}

        {renderField(
          'Date of Birth',
          'dob',
          'DD/MM/YYYY',
        )}

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Gender
          </Text>

          {editing ? (
            <View style={styles.genderRow}>
              {[
                'Male',
                'Female',
                'Other',
              ].map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.genderButton,
                    profile.gender === item &&
                      styles.selectedGender,
                  ]}
                  onPress={() =>
                    updateField(
                      'gender',
                      item,
                    )
                  }>

                  <Text
                    style={{
                      color:
                        profile.gender === item
                          ? '#FFFFFF'
                          : C.text,
                    }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>
              {profile.gender ||
                'Not added'}
            </Text>
          )}
        </View>

        {renderField(
          'Daily Task Goal',
          'dailyGoal',
          '5',
          'number-pad',
        )}
      </Card>

      {/* Activity */}
      <Text style={styles.heading}>
        My Activity
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {tasks.length}
          </Text>

          <Text style={styles.statLabel}>
            Total Tasks
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {completed}
          </Text>

          <Text style={styles.statLabel}>
            Completed
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {pending}
          </Text>

          <Text style={styles.statLabel}>
            Pending
          </Text>
        </View>
      </View>

      {/* Daily Progress */}
      <Card>
        <Text style={styles.heading}>
          Daily Goal Progress
        </Text>

        <Text style={styles.goalText}>
          {todayCompleted} / {dailyTarget} tasks
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>
      </Card>

      {/* Save Changes */}
      {editing && (
        <ActionButton
          label="Save Changes"
          onPress={saveProfile}
        />
      )}

      <Text style={styles.note}>
        Profile information is saved locally on this device.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Circular Back Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },

  floatingBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#394B70',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },

  backArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 29,
    textAlign: 'center',
    includeFontPadding: false,
    paddingBottom:12

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

  // Profile
  profileCard: {
    backgroundColor: C.mint,
    alignItems: 'center',
    paddingVertical: 25,
    borderRadius: 15,
  },

  avatar: {
    width: 105,
    height: 105,
    borderRadius: 55,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  initials: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  changePhoto: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },

  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginTop: 15,
  },

  subtitle: {
    color: C.muted,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },

  editButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 20,
    marginTop: 18,
  },

  editText: {
    color: C.navy,
    fontWeight: '700',
  },

  // Details
  heading: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    marginBottom: 14,
    marginTop: 12,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    marginBottom: 8,
  },

  input: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 13,
    color: C.text,
  },

  value: {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },

  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  genderButton: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: C.background,
  },

  selectedGender: {
    backgroundColor: C.navy,
  },

  // Statistics
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 22,
    borderRadius: 15,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: C.navy,
  },

  statLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 7,
  },

  // Goal Progress
  goalText: {
    fontSize: 17,
    fontWeight: '700',
    color: C.navy,
    marginBottom: 14,
  },

  progressTrack: {
    height: 13,
    backgroundColor: '#DCE4EC',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: C.green,
    borderRadius: 10,
  },

  note: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 12,
    marginTop: 20,
  },
});

export default ProfileScreen;
