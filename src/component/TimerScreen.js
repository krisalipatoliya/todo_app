
import React, {useState, useEffect, useRef} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import C from '../units/Colors';
import {Card, ActionButton, ProgressBar} from './UI';

const TimerScreen = ({onBack}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const deadlineRef = useRef(null);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );

      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        deadlineRef.current = null;
        setRunning(false);
        setSessions(previous => previous + 1);

        Alert.alert(
          'Timer Completed!',
          'Great job! Your focus session is complete.',
        );
      }
    }, 250);

    return () => clearInterval(interval);
  }, [running]);

  const startTimer = () => {
    if (running) {
      return;
    }

    const duration =
      secondsLeft > 0
        ? secondsLeft
        : selectedMinutes * 60;

    if (secondsLeft === 0) {
      setSecondsLeft(duration);
    }

    deadlineRef.current = Date.now() + duration * 1000;
    setRunning(true);
  };

  const pauseTimer = () => {
    if (deadlineRef.current) {
      setSecondsLeft(
        Math.max(
          0,
          Math.ceil(
            (deadlineRef.current - Date.now()) / 1000,
          ),
        ),
      );
    }

    deadlineRef.current = null;
    setRunning(false);
  };

  const resetTimer = () => {
    deadlineRef.current = null;
    setRunning(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const selectDuration = minutes => {
    deadlineRef.current = null;
    setRunning(false);
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return (
      String(minutes).padStart(2, '0') +
      ':' +
      String(remaining).padStart(2, '0')
    );
  };

  const totalSeconds = selectedMinutes * 60;

  const progress =
    ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Floating Back Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.floatingBack}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Back to Home">

          <Text style={styles.backArrow}>
            ←
          </Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}>
            Focus Timer ⏱
          </Text>

          <Text style={styles.headerSubtitle}>
            Stay focused and productive
          </Text>
        </View>
      </View>

      {/* Choose Focus Duration */}
      <Card>
        <Text style={styles.heading}>
          Choose Focus Duration
        </Text>

        <View style={styles.durationRow}>
          {[5, 15, 25, 45].map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.durationButton,
                selectedMinutes === minutes &&
                  styles.selectedDuration,
              ]}
              onPress={() => selectDuration(minutes)}>

              <Text
                style={[
                  styles.durationText,
                  selectedMinutes === minutes &&
                    styles.selectedDurationText,
                ]}>
                {minutes} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Focus Timer */}
      <Card style={styles.timerCard}>
        <Text style={styles.timerLabel}>
          FOCUS SESSION
        </Text>

        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>
            {formatTime(secondsLeft)}
          </Text>

          <Text style={styles.timerStatus}>
            {running ? 'Focusing...' : 'Ready'}
          </Text>
        </View>

        <ProgressBar
          progress={progress}
          color={C.navy}
        />

        <Text style={styles.progressText}>
          {Math.round(progress)}% completed
        </Text>

        <ActionButton
          label={running ? '⏸ Pause' : '▶ Start'}
          onPress={running ? pauseTimer : startTimer}
        />

        <View style={{height: 12}} />

        <ActionButton
          label="↻ Reset"
          outline
          onPress={resetTimer}
        />
      </Card>

      {/* Focus Summary */}
      <Card>
        <Text style={styles.heading}>
          Today's Focus Summary
        </Text>

        <Text style={styles.summaryNumber}>
          {sessions}
        </Text>

        <Text style={styles.summaryLabel}>
          Sessions completed this visit
        </Text>
      </Card>
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
    paddingBottom: 40,
  },

  // Floating Back Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
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
    fontSize: 20,
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

  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 16,
  },

  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  durationButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: C.background,
    borderRadius: 12,
  },

  selectedDuration: {
    backgroundColor: C.navy,
  },

  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.text,
  },

  selectedDurationText: {
    color: '#FFFFFF',
  },

  timerCard: {
    backgroundColor: C.mint,
    paddingVertical: 30,
  },

  timerLabel: {
    textAlign: 'center',
    color: C.muted,
    fontWeight: '700',
    letterSpacing: 2,
  },

  timerCircle: {
    width: 235,
    height: 235,
    borderRadius: 118,
    borderWidth: 10,
    borderColor: C.green,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 30,
  },

  timerText: {
    fontSize: 48,
    fontWeight: '900',
    color: C.navy,
  },

  timerStatus: {
    color: C.muted,
    marginTop: 8,
  },

  progressText: {
    textAlign: 'center',
    color: C.navy,
    marginVertical: 15,
    fontWeight: '600',
  },

  summaryNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: C.navy,
    textAlign: 'center',
  },

  summaryLabel: {
    textAlign: 'center',
    color: C.muted,
    marginTop: 8,
  },
});

export default TimerScreen;
