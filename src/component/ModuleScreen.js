
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import C from '../units/Colors';
import {ActionButton} from './UI';

const ModuleScreen = ({title, onBack}) => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (title !== 'Timer' || !running) {
      return;
    }

    const interval = setInterval(() => {
      setSeconds(previous => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running, title]);

  const minutes = String(
    Math.floor(seconds / 60),
  ).padStart(2, '0');

  const remainingSeconds = String(
    seconds % 60,
  ).padStart(2, '0');

  const resetTimer = () => {
    setRunning(false);
    setSeconds(0);
  };

  return (
    <SafeAreaView style={styles.page}>
      <Text style={styles.title}>
        {title}
      </Text>

      {title === 'Timer' ? (
        <>
          <Text style={styles.clock}>
            {minutes}:{remainingSeconds}
          </Text>

          <ActionButton
            label={running ? 'Pause' : 'Start'}
            onPress={() =>
              setRunning(previous => !previous)
            }
          />

          <View style={{height: 12}} />

          <ActionButton
            label="Reset"
            outline
            onPress={resetTimer}
          />
        </>
      ) : (
        <Text style={styles.message}>
          This feature is coming soon.
        </Text>
      )}

      <View style={{height: 20}} />

      <ActionButton
        label="← Back to Home"
        outline
        onPress={onBack}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.mint,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.navy,
    textAlign: 'center',
    marginBottom: 30,
  },
  clock: {
    fontSize: 60,
    fontWeight: '800',
    color: C.navy,
    textAlign: 'center',
    marginBottom: 35,
  },
  message: {
    fontSize: 17,
    textAlign: 'center',
    color: C.muted,
    marginBottom: 30,
  },
});

export default ModuleScreen;
