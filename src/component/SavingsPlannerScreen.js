
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

const SavingsPlannerScreen = ({onBack}) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [goals, setGoals] = useState([]);
  const [amountInputs, setAmountInputs] = useState({});

  const addGoal = () => {
    const target = Number(targetAmount);

    if (
      !goalName.trim() ||
      !Number.isFinite(target) ||
      target <= 0
    ) {
      Alert.alert(
        'Invalid Goal',
        'Enter a goal name and valid target amount.',
      );
      return;
    }

    setGoals(previous => [
      ...previous,
      {
        id: String(Date.now()) + Math.random(),
        name: goalName.trim(),
        target,
        saved: 0,
      },
    ]);

    setGoalName('');
    setTargetAmount('');
  };

  const addSavings = id => {
    const amount = Number(amountInputs[id]);

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Enter an amount greater than zero.',
      );
      return;
    }

    setGoals(previous =>
      previous.map(goal =>
        goal.id === id
          ? {...goal, saved: goal.saved + amount}
          : goal,
      ),
    );

    setAmountInputs(previous => ({
      ...previous,
      [id]: '',
    }));
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
            Savings Planner 💰
          </Text>

          <Text style={styles.headerSubtitle}>
            Save money for your future goals
          </Text>
        </View>
      </View>

      {/* Create Savings Goal */}
      <Card>
        <Text style={styles.heading}>
          Create Savings Goal
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Goal name (e.g. New Phone)"
          placeholderTextColor={C.muted}
          value={goalName}
          onChangeText={setGoalName}
        />

        <TextInput
          style={styles.input}
          placeholder="Target amount (₹)"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <ActionButton
          label="+ Create Goal"
          onPress={addGoal}
        />
      </Card>

      {/* My Savings Goals */}
      <Text style={styles.heading}>
        My Savings Goals
      </Text>

      {goals.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            No savings goals yet. Create your first goal!
          </Text>
        </Card>
      ) : (
        goals.map(goal => {
          const percentage = Math.min(
            (goal.saved / goal.target) * 100,
            100,
          );

          return (
            <Card key={goal.id}>
              <View style={styles.row}>
                <Text style={styles.goalTitle}>
                  {goal.name}
                </Text>
              </View>

              <Text style={styles.amount}>
                ₹{goal.saved.toLocaleString('en-IN')} / ₹
                {goal.target.toLocaleString('en-IN')}
              </Text>

              <ProgressBar progress={percentage} />

              <Text style={styles.percentage}>
                {percentage.toFixed(0)}% completed
              </Text>

              {goal.saved >= goal.target && (
                <Text style={styles.success}>
                  🎉 Goal achieved!
                </Text>
              )}

              <TextInput
                style={styles.input}
                placeholder="Add savings amount (₹)"
                placeholderTextColor={C.muted}
                keyboardType="decimal-pad"
                value={amountInputs[goal.id] || ''}
                onChangeText={value =>
                  setAmountInputs(previous => ({
                    ...previous,
                    [goal.id]: value,
                  }))
                }
              />

              <ActionButton
                label="+ Add Savings"
                onPress={() => addSavings(goal.id)}
              />
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

  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    flex: 1,
  },

  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: C.navy,
    marginBottom: 14,
  },

  percentage: {
    color: C.muted,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
  },

  success: {
    color: '#188C5B',
    fontWeight: '700',
    marginBottom: 12,
  },

  empty: {
    color: C.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default SavingsPlannerScreen;
