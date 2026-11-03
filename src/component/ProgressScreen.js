
import React from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import C from '../units/Colors';

import {
  Card,
  ProgressBar,
} from './UI';

const categories = [
  'Study',
  'Personal',
  'Habit',
  'Sport',
];

const ProgressScreen = ({
  tasks = [],
  onNavigate,
}) => {
  const completed = tasks.filter(
    task => task.done,
  ).length;

  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const handleBackHome = () => {
    onNavigate?.('Home');
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Floating Back Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.floatingBack}
          onPress={handleBackHome}
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
            Weekly Report
          </Text>

          <Text style={styles.headerSubtitle}>
            Your progress at a glance
          </Text>
        </View>
      </View>

      {/* Overall Completion */}
      <Card style={{backgroundColor: C.mint}}>
        <Text style={styles.total}>
          {percentage}%
        </Text>

        <Text style={styles.center}>
          Overall Completion
        </Text>

        <ProgressBar progress={percentage} />

        <Text style={styles.center}>
          {completed} completed out of {tasks.length} tasks
        </Text>
      </Card>

      {/* Category Progress */}
      <Text style={styles.heading}>
        Categories
      </Text>

      {categories.map((category, index) => {
        const all = tasks.filter(
          task => task.category === category,
        );

        const done = all.filter(
          task => task.done,
        ).length;

        const percent = all.length
          ? Math.round((done / all.length) * 100)
          : 0;

        const progressColors = [
          '#F0BDCD',
          '#CBE7D4',
          '#B6DFF2',
          '#F3D6A7',
        ];

        return (
          <Card key={category}>
            <View style={styles.row}>
              <Text style={styles.category}>
                {['📚', '🩷', '🌱', '🏃'][index]}
                {'  '}
                {category}
              </Text>

              <Text style={styles.categoryCount}>
                {done}/{all.length}
              </Text>
            </View>

            <ProgressBar
              progress={percent}
              color={progressColors[index]}
            />
          </Card>
        );
      })}
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

  // Overall Progress
  total: {
    fontSize: 52,
    fontWeight: '900',
    color: C.navy,
    textAlign: 'center',
    marginTop: 12,
  },

  center: {
    color: C.text,
    textAlign: 'center',
    marginVertical: 14,
  },

  heading: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
    marginVertical: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  category: {
    color: C.text,
    fontWeight: '700',
  },

  categoryCount: {
    color: C.muted,
  },
});

export default ProgressScreen;
