
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

import {
  Card,
  ActionButton,
  ProgressBar,
} from './UI';

const GoalTrackerScreen = ({onBack}) => {
  const [goalName, setGoalName] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Personal');
  const [goals, setGoals] = useState([]);
  const [progressInputs, setProgressInputs] = useState({});

  const categories = [
    'Personal',
    'Study',
    'Fitness',
    'Career',
  ];

  // Create Goal
  const addGoal = () => {
    const targetValue = Number(target);

    if (
      !goalName.trim() ||
      !Number.isFinite(targetValue) ||
      targetValue <= 0
    ) {
      Alert.alert(
        'Invalid Goal',
        'Enter a goal name and valid target.',
      );
      return;
    }

    const newGoal = {
      id: `${Date.now()}-${Math.random()}`,
      name: goalName.trim(),
      target: targetValue,
      current: 0,
      category,
    };

    setGoals(previous => [newGoal, ...previous]);

    setGoalName('');
    setTarget('');
  };

  // Update Progress
  const updateProgress = id => {
    const amount = Number(progressInputs[id]);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(
        'Invalid Value',
        'Enter a positive progress amount.',
      );
      return;
    }

    setGoals(previous =>
      previous.map(goal =>
        goal.id === id
          ? {
              ...goal,
              current: Math.min(
                goal.current + amount,
                goal.target,
              ),
            }
          : goal,
      ),
    );

    setProgressInputs(previous => ({
      ...previous,
      [id]: '',
    }));
  };

  const completedGoals = goals.filter(
    goal => goal.current >= goal.target,
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Compact Floating Back Header */}
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
            Goal Tracker 🎯
          </Text>

          <Text
            style={styles.headerSubtitle}
            numberOfLines={2}>
            Turn your dreams into achievements
          </Text>
        </View>
      </View>

      {/* Achievements */}
      <Card style={{backgroundColor: C.mint}}>
        <Text style={styles.summaryTitle}>
          Your Achievements
        </Text>

        <Text style={styles.summaryText}>
          {completedGoals} / {goals.length}
        </Text>

        <Text style={styles.summaryLabel}>
          Goals completed
        </Text>
      </Card>

      {/* Create Goal */}
      <Card>
        <Text style={styles.heading}>
          Create New Goal
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Goal name (e.g. Read 10 books)"
          placeholderTextColor={C.muted}
          value={goalName}
          onChangeText={setGoalName}
        />

        <TextInput
          style={styles.input}
          placeholder="Target (e.g. 10)"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
          value={target}
          onChangeText={setTarget}
        />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}>

          {categories.map(item => (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryButton,
                category === item && styles.selectedCategory,
              ]}>

              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.selectedCategoryText,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ActionButton
          label="+ Create Goal"
          onPress={addGoal}
        />
      </Card>

      {/* Goal List */}
      <Text style={styles.heading}>
        My Goals
      </Text>

      {goals.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            No goals yet. Create your first goal!
          </Text>
        </Card>
      ) : (
        goals.map(goal => {
          const percentage =
            (goal.current / goal.target) * 100;

          const isCompleted = percentage >= 100;

          return (
            <Card key={goal.id}>
              <View style={styles.row}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalName}>
                    {goal.name}
                  </Text>

                  <Text style={styles.categoryLabel}>
                    {goal.category}
                  </Text>
                </View>
              </View>

              <Text style={styles.count}>
                {goal.current} / {goal.target}
              </Text>

              <ProgressBar
                progress={percentage}
                color={C.green}
              />

              <Text style={styles.percentage}>
                {percentage.toFixed(0)}% completed
              </Text>

              {isCompleted ? (
                <Text style={styles.success}>
                  🎉 Goal achieved!
                </Text>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Add progress (e.g. 1)"
                    placeholderTextColor={C.muted}
                    keyboardType="decimal-pad"
                    value={progressInputs[goal.id] || ''}
                    onChangeText={value =>
                      setProgressInputs(previous => ({
                        ...previous,
                        [goal.id]: value,
                      }))
                    }
                  />

                  <ActionButton
                    label="+ Update Progress"
                    onPress={() =>
                      updateProgress(goal.id)
                    }
                  />
                </>
              )}
            </Card>
          );
        })
      )}
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

  // Compact Floating Back Header
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

  heading: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    marginBottom: 15,
  },

  // Achievements
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.navy,
    textAlign: 'center',
  },

  summaryText: {
    fontSize: 48,
    fontWeight: '900',
    color: C.navy,
    textAlign: 'center',
    marginTop: 12,
  },

  summaryLabel: {
    color: C.muted,
    textAlign: 'center',
    marginTop: 5,
  },

  // Form
  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 13,
    color: C.text,
    marginBottom: 12,
  },

  categoryScroll: {
    marginBottom: 15,
  },

  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.background,
    marginRight: 8,
  },

  selectedCategory: {
    backgroundColor: C.navy,
  },

  categoryText: {
    color: C.text,
    fontSize: 14,
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  // Goal List
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  goalInfo: {
    flex: 1,
  },

  goalName: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
  },

  categoryLabel: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },

  count: {
    fontSize: 16,
    fontWeight: '700',
    color: C.navy,
    marginBottom: 12,
  },

  percentage: {
    color: C.muted,
    marginTop: 10,
    marginBottom: 15,
  },

  success: {
    color: '#148451',
    fontWeight: '800',
    marginTop: 10,
  },

  empty: {
    color: C.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default GoalTrackerScreen;
