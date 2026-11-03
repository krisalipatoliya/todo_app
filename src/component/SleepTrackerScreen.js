
import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import C from '../units/Colors';
import {Card, ActionButton, ProgressBar} from './UI';

// Convert HH:MM to minutes
const parseTime = value => {
  const time = String(value).trim();

  if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

// Dynamic sleep tips
const getSleepTip = hours => {
  if (hours === null || hours === undefined) {
    return {
      title: '💡 Sleep Tip',
      message:
        'Record your sleep to get personalized tips for improving your sleep routine.',
      details:
        'Try going to bed and waking up at consistent times every day. A regular sleep schedule can help improve your sleep quality.',
    };
  }

  if (hours < 5) {
    return {
      title: '😴 Very Low Sleep',
      message:
        'You slept less than 5 hours. Your sleep duration is quite low.',
      details:
        'Try creating a consistent bedtime routine, reducing late-night screen time and allowing more time for sleep. If short sleep continues regularly, consider discussing it with a healthcare professional.',
    };
  }

  if (hours < 7) {
    return {
      title: '🌙 Improve Your Sleep',
      message:
        'You slept less than 7 hours. Try getting some extra rest.',
      details:
        'Aim for a consistent sleep schedule. Reduce caffeine late in the day, keep your bedroom quiet and dark, and avoid using your phone immediately before bedtime.',
    };
  }

  if (hours <= 9) {
    return {
      title: '✅ Healthy Sleep',
      message:
        'Great! Your sleep duration is within the typical recommended range for adults.',
      details:
        'You recorded 7–9 hours of sleep. Continue maintaining regular sleep and wake-up times. Remember that sleep quality matters as well as duration.',
    };
  }

  return {
    title: '💤 Long Sleep',
    message:
      'You slept more than 9 hours. Keep your sleep schedule consistent.',
    details:
      'Occasionally sleeping longer can be normal. Focus on sleep quality and your energy during the day. If you regularly sleep for long periods but still feel tired, consider speaking with a healthcare professional.',
  };
};

const SleepTrackerScreen = ({onBack}) => {
  const [sleepTime, setSleepTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepGoal, setSleepGoal] = useState('8');
  const [records, setRecords] = useState([]);

  // Save sleep record
  const calculateSleep = () => {
    const start = parseTime(sleepTime);
    const end = parseTime(wakeTime);
    const goal = Number(sleepGoal);

    if (
      start === null ||
      end === null ||
      !Number.isFinite(goal) ||
      goal <= 0 ||
      goal > 24
    ) {
      Alert.alert(
        'Invalid Input',
        'Enter time in HH:MM format and a valid sleep goal.',
      );
      return;
    }

    let duration = end - start;

    if (duration <= 0) {
      duration += 24 * 60;
    }

    const hours = duration / 60;

    const record = {
      id: String(Date.now()) + Math.random(),
      date: new Date().toLocaleDateString('en-GB'),
      sleepTime: sleepTime.trim(),
      wakeTime: wakeTime.trim(),
      hours,
      goal,
    };

    setRecords(previous => [record, ...previous]);

    Alert.alert(
      'Sleep Recorded',
      `You slept for ${hours.toFixed(1)} hours.`,
    );
  };

  // Delete sleep record
  const deleteRecord = id => {
    setRecords(previous =>
      previous.filter(record => record.id !== id),
    );
  };

  const averageSleep = records.length
    ? records.reduce(
        (total, record) => total + record.hours,
        0,
      ) / records.length
    : 0;

  const latestRecord = records[0];

  const progress = latestRecord
    ? Math.min(
        (latestRecord.hours / latestRecord.goal) * 100,
        100,
      )
    : 0;

  const sleepTip = getSleepTip(
    latestRecord ? latestRecord.hours : null,
  );

  const showSleepTip = () => {
    Alert.alert(
      sleepTip.title,
      sleepTip.details,
      [{text: 'OK'}],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
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
            Sleep Tracker 🌙
          </Text>

          <Text style={styles.headerSubtitle}>
            Track your sleep and improve your routine
          </Text>
        </View>
      </View>

      {/* Last Recorded Sleep */}
      <Card>
        <Text style={styles.heading}>
          Last Recorded Sleep
        </Text>

        <Text style={styles.bigNumber}>
          {latestRecord
            ? latestRecord.hours.toFixed(1)
            : '0.0'}h
        </Text>

        <Text style={styles.center}>
          Sleep duration
        </Text>

        <ProgressBar
          progress={progress}
          color={C.navy}
        />

        <Text style={styles.progressText}>
          {Math.round(progress)}% of sleep goal
        </Text>
      </Card>

      {/* Record Your Sleep */}
      <Card>
        <Text style={styles.heading}>
          Record Your Sleep
        </Text>

        <Text style={styles.label}>
          Bedtime (24-hour format)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="23:00"
          placeholderTextColor={C.muted}
          value={sleepTime}
          onChangeText={setSleepTime}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>
          Wake-up Time (24-hour format)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="07:00"
          placeholderTextColor={C.muted}
          value={wakeTime}
          onChangeText={setWakeTime}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>
          Daily Sleep Goal (hours)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="8"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
          value={sleepGoal}
          onChangeText={setSleepGoal}
        />

        <ActionButton
          label="+ Save Sleep Record"
          onPress={calculateSleep}
        />
      </Card>

      {/* Average Sleep */}
      <Card>
        <Text style={styles.heading}>
          Average Sleep
        </Text>

        <Text style={styles.average}>
          {averageSleep.toFixed(1)} hours
        </Text>

        <Text style={styles.center}>
          Based on {records.length} recorded nights
        </Text>
      </Card>

      {/* Sleep History */}
      <Text style={styles.heading}>
        Sleep History
      </Text>

      {records.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            No sleep records yet.
          </Text>
        </Card>
      ) : (
        records.map(record => (
          <Card key={record.id}>
            <View style={styles.row}>
              <View style={{flex: 1}}>
                <Text style={styles.recordTitle}>
                  🌙 {record.hours.toFixed(1)} hours
                </Text>

                <Text style={styles.recordDetail}>
                  {record.date}
                </Text>

                <Text style={styles.recordDetail}>
                  {record.sleepTime} → {record.wakeTime}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => deleteRecord(record.id)}>

                <Text style={styles.delete}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      )}

      {/* Dynamic Sleep Tip */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={showSleepTip}
        accessibilityRole="button"
        accessibilityLabel="View detailed sleep tip">

        <Card>
          <View style={styles.tipHeader}>
            <Text style={styles.tipHeading}>
              {sleepTip.title}
            </Text>

            <Text style={styles.tipArrow}>
              →
            </Text>
          </View>

          <Text style={styles.tip}>
            {sleepTip.message}
          </Text>

          <Text style={styles.tipHint}>
            Tap to read more
          </Text>
        </Card>
      </TouchableOpacity>
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

  heading: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    marginBottom: 15,
  },

  bigNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: C.navy,
    textAlign: 'center',
  },

  center: {
    color: C.muted,
    textAlign: 'center',
    marginVertical: 10,
  },

  progressText: {
    textAlign: 'center',
    color: C.navy,
    fontWeight: '700',
    marginTop: 13,
  },

  label: {
    fontSize: 14,
    color: C.text,
    fontWeight: '700',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 13,
    backgroundColor: C.background,
    color: C.text,
    marginBottom: 18,
  },

  average: {
    fontSize: 32,
    fontWeight: '800',
    color: C.navy,
    textAlign: 'center',
  },

  recordTitle: {
    fontSize: 17,
    color: C.text,
    fontWeight: '800',
  },

  recordDetail: {
    color: C.muted,
    fontSize: 13,
    marginTop: 5,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  delete: {
    color: '#E15667',
    fontWeight: '700',
  },

  empty: {
    color: C.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },

  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  tipHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    flex: 1,
  },

  tipArrow: {
    fontSize: 22,
    color: C.navy,
    marginLeft: 12,
  },

  tip: {
    color: C.muted,
    lineHeight: 23,
  },

  tipHint: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
  },
});

export default SleepTrackerScreen;
