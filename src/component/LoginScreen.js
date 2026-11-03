
import React, {useState} from 'react';

import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

const LoginScreen = ({onLogin}) => {
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');

  const handleLogin = () => {
    const name = username.trim();
    const number = mobile.replace(/\D/g, '');

    if (!name) {
      Alert.alert('Error', 'Enter your username.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(number)) {
      Alert.alert(
        'Invalid Mobile Number',
        'Enter a valid 10-digit Indian mobile number.',
      );
      return;
    }

    // Direct login without OTP
    onLogin?.({
      name,
      phone: `+91${number}`,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#D1DBE2"
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }>

        <ScrollView
          contentContainerStyle={styles.card}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Image
            source={require('../assets/self-discipline.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.content}>
            <Text style={styles.title}>
              Develop good habits
            </Text>

            <Text style={styles.description}>
              Good habits shape success and well-being
              through small daily actions.
            </Text>

            <Text style={styles.label}>
              Username
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
            />

            <Text style={styles.label}>
              Mobile Number
            </Text>

            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>
                  +91
                </Text>
              </View>

              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#999"
                value={mobile}
                onChangeText={value =>
                  setMobile(
                    value.replace(/\D/g, '').slice(0, 10),
                  )
                }
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.8}>

              <Text style={styles.buttonText}>
                Continue
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#D1DBE2',
    padding: 16,
  },

  card: {
    flexGrow: 1,
    backgroundColor: '#F1F1F1',
    borderRadius: 35,
    overflow: 'hidden',
  },

  heroImage: {
    width: '100%',
    height: 300,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 35,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000000',
  },

  description: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#000000',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },

  countryCode: {
    height: 52,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countryText: {
    fontSize: 16,
    color: '#394B70',
    fontWeight: '700',
  },

  phoneInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  button: {
    backgroundColor: '#394B70',
    height: 58,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  buttonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default LoginScreen;
