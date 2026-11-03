
import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import C from '../units/Colors';

import {
  Card,
  ActionButton,
  ProgressBar,
} from './UI';

const moods = [
  {emoji: '😊', label: 'Happy'},
  {emoji: '😌', label: 'Calm'},
  {emoji: '😐', label: 'Okay'},
  {emoji: '😟', label: 'Anxious'},
  {emoji: '😢', label: 'Sad'},
];

const activities = [
  {id: 1, icon: '💧', name: 'Drink Water'},
  {id: 2, icon: '🚶', name: 'Take a Walk'},
  {id: 3, icon: '📖', name: 'Read a Book'},
  {id: 4, icon: '🧘', name: 'Meditate'},
];

const MentalWellnessScreen = ({onBack}) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [breathing, setBreathing] = useState(false);
  const [seconds, setSeconds] = useState(30);

  // Breathing timer
  useEffect(() => {
    if (!breathing) {
      return;
    }

    if (seconds <= 0) {
      setBreathing(false);
      return;
    }

    const timer = setTimeout(() => {
      setSeconds(previous => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [breathing, seconds]);

  // Toggle self-care activity
  const toggleActivity = id => {
    setCompleted(previous =>
      previous.includes(id)
        ? previous.filter(item => item !== id)
        : [...previous, id],
    );
  };

  const startBreathing = () => {
    setSeconds(30);
    setBreathing(true);
  };

  const progress = Math.round(
    (completed.length / activities.length) * 100,
  );

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
            Mental Wellness 🧠
          </Text>

          <Text style={styles.headerSubtitle}>
            Take a little time for yourself
          </Text>
        </View>
      </View>

      {/* Mood Tracker */}
      <Card style={styles.moodCard}>
        <Text style={styles.heading}>
          How are you feeling today?
        </Text>

        <View style={styles.moodRow}>
          {moods.map(mood => (
            <TouchableOpacity
              key={mood.label}
              style={[
                styles.moodItem,
                selectedMood === mood.label &&
                  styles.selectedMood,
              ]}
              onPress={() =>
                setSelectedMood(mood.label)
              }>

              <Text style={styles.emoji}>
                {mood.emoji}
              </Text>

              <Text style={styles.moodLabel}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMood && (
          <Text style={styles.info}>
            Today you're feeling {selectedMood}.
          </Text>
        )}
      </Card>

      {/* Breathing Exercise */}
      <Card>
        <Text style={styles.heading}>
          🌿 Breathing Exercise
        </Text>

        <Text style={styles.description}>
          Relax your mind with a short breathing session.
        </Text>

        <View style={styles.circle}>
          <Text style={styles.timer}>
            {seconds}s
          </Text>

          <Text style={styles.circleText}>
            {breathing
              ? seconds % 8 >= 4
                ? 'Breathe Out'
                : 'Breathe In'
              : 'Relax'}
          </Text>
        </View>

        <ActionButton
          label={
            breathing
              ? 'Stop Exercise'
              : 'Start Breathing'
          }
          onPress={() => {
            if (breathing) {
              setBreathing(false);
              setSeconds(30);
            } else {
              startBreathing();
            }
          }}
        />
      </Card>

      {/* Self-Care Checklist */}
      <Card>
        <Text style={styles.heading}>
          ✨ Self-Care Checklist
        </Text>

        <Text style={styles.description}>
          Small daily actions make a difference.
        </Text>

        {activities.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.activity}
            onPress={() =>
              toggleActivity(item.id)
            }>

            <Text style={styles.activityIcon}>
              {item.icon}
            </Text>

            <Text style={styles.activityName}>
              {item.name}
            </Text>

            <Text style={styles.checkbox}>
              {completed.includes(item.id)
                ? '☑'
                : '☐'}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.progressText}>
          Daily Self-Care Progress: {progress}%
        </Text>

        <ProgressBar
          progress={progress}
          color={C.green}
        />
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
    marginBottom: 14,
  },

  description: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
    marginBottom: 15,
  },

  // Mood Card
  moodCard: {
    backgroundColor: '#F9E6EC',
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  moodItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 12,
    minWidth: 52,
  },

  selectedMood: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.navy,
  },

  emoji: {
    fontSize: 28,
  },

  moodLabel: {
    fontSize: 10,
    color: C.text,
    marginTop: 7,
  },

  info: {
    marginTop: 15,
    color: C.navy,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Breathing Circle
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.mint,
    borderWidth: 4,
    borderColor: C.green,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 25,
  },

  timer: {
    fontSize: 38,
    fontWeight: '800',
    color: C.navy,
  },

  circleText: {
    fontSize: 14,
    color: C.text,
    marginTop: 5,
  },

  // Self-Care Checklist
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  activityIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  activityName: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontWeight: '600',
  },

  checkbox: {
    fontSize: 23,
    color: C.navy,
  },

  progressText: {
    color: C.navy,
    marginVertical: 12,
    fontWeight: '700',
  },
});

export default MentalWellnessScreen;
