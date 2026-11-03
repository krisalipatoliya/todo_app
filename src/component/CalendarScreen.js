
import React, {useState} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from 'react-native';

import C from '../units/Colors';
import {Card, Empty} from './UI';

import {
  scheduleTaskNotification,
  cancelTaskNotification,
  testNotification,
  testScheduledNotification,
  getScheduledNotifications,
} from '../units/NotificationService';

const categories = ['Study', 'Personal', 'Habit', 'Sport'];

const dateKey = date =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const CalendarScreen = ({
  tasks = [],
  onAdd,
  onToggle,
  onNavigate,
}) => {
  const [month, setMonth] = useState(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ),
  );

  const [selected, setSelected] = useState(
    dateKey(new Date()),
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Personal');
  const [taskTime, setTaskTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  const todayKey = dateKey(new Date());
  const isPastDate = selected < todayKey;

  // Back to Home
  const handleBackHome = () => {
    onNavigate?.('Home');
  };

  // Calendar month days
  const leading = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  ).getDay();

  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const cells = Array.from(
    {
      length:
        Math.ceil((leading + daysInMonth) / 7) * 7,
    },
    (_, index) => {
      const day = index - leading + 1;

      return day >= 1 && day <= daysInMonth
        ? day
        : null;
    },
  );

  const changeMonth = value => {
    setMonth(previous =>
      new Date(
        previous.getFullYear(),
        previous.getMonth() + value,
        1,
      ),
    );
  };

  const selectedTasks = tasks.filter(
    task => task.date === selected,
  );

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setTaskTitle('');
    setTaskCategory('Personal');
    setTaskTime('');
  };

  // Save task for selected date
  const handleAddTask = async () => {
    if (saving) return;

    if (selected < dateKey(new Date())) {
      Alert.alert(
        'Past Date',
        'You cannot add tasks to past dates.',
      );
      return;
    }

    const title = taskTitle.trim();
    const time = taskTime.trim();

    if (!title) {
      Alert.alert(
        'Required',
        'Please enter task name.',
      );
      return;
    }

    if (
      time &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ) {
      Alert.alert(
        'Invalid Time',
        'Enter HH:MM format. Example: 17:30',
      );
      return;
    }

    if (time) {
      const reminderDate = new Date(
        `${selected}T${time}:00`,
      );

      if (
        !Number.isFinite(reminderDate.getTime()) ||
        reminderDate.getTime() <= Date.now()
      ) {
        Alert.alert(
          'Invalid Time',
          'Please select a future reminder time.',
        );
        return;
      }
    }

    if (typeof onAdd !== 'function') {
      Alert.alert(
        'Error',
        'Calendar task saving is not connected.',
      );
      return;
    }

    setSaving(true);

    const taskId = `${Date.now()}-${Math.random()}`;
    let taskSaved = false;
    let reminderStatus = 'No reminder requested';

    try {
      await onAdd(
        title,
        taskCategory,
        taskId,
        time || null,
        selected,
      );

      taskSaved = true;

      if (time) {
        try {
          const registered =
            await scheduleTaskNotification(
              taskId,
              title,
              selected,
              time,
            );

          reminderStatus = registered
            ? 'Reminder registered'
            : 'Reminder registration not confirmed';
        } catch (error) {
          reminderStatus =
            `Reminder failed: ${error.message}`;
        }
      }

      setModalVisible(false);
      setTaskTitle('');
      setTaskCategory('Personal');
      setTaskTime('');
      setTestResult(reminderStatus);

      Alert.alert(
        'Task Saved',
        `Task: ${title}\nDate: ${selected}\nTime: ${
          time || 'Not set'
        }\n\n${reminderStatus}`,
      );
    } catch (error) {
      Alert.alert(
        'Error',
        taskSaved
          ? `Task saved, but something went wrong: ${error.message}`
          : `Task could not be saved: ${error.message}`,
      );
    } finally {
      setSaving(false);
    }
  };

  // Mark task completed or pending
  const handleToggleTask = async task => {
    if (typeof onToggle !== 'function') {
      Alert.alert(
        'Error',
        'Task completion is not connected.',
      );
      return;
    }

    const completing = !task.done;

    onToggle(task.id);

    if (!task.time) return;

    try {
      if (completing) {
        await cancelTaskNotification(task.id);
      } else {
        const reminderDate = new Date(
          `${task.date}T${task.time}:00`,
        );

        if (reminderDate.getTime() > Date.now()) {
          await scheduleTaskNotification(
            task.id,
            task.title,
            task.date,
            task.time,
          );
        }
      }
    } catch (error) {
      console.log(
        'Reminder update error:',
        error,
      );
    }
  };

  // Notification diagnostics
  const runTest = async kind => {
    if (testing) return;

    setTesting(true);
    setTestResult('Checking...');

    try {
      if (kind === 'now') {
        await testNotification();

        setTestResult(
          'Immediate test submitted. Check notification shade.',
        );

        Alert.alert(
          'Test Now',
          'Notification bar niche swipe kari check karo.',
        );
      } else if (kind === 'scheduled') {
        const registered =
          await testScheduledNotification();

        const result = registered
          ? '15-second reminder registered'
          : '15-second reminder not confirmed';

        setTestResult(result);

        Alert.alert(
          'Scheduled Test',
          `${result}.\n\nApp background ma mokli notification check karo.`,
        );
      } else {
        const pending =
          await getScheduledNotifications();

        const preview = pending
          .slice(0, 5)
          .map(
            item =>
              `${item.notification?.title || 'Task'}: ${
                item.trigger?.timestamp
                  ? new Date(
                      item.trigger.timestamp,
                    ).toLocaleString()
                  : 'No timestamp'
              }`,
          )
          .join('\n');

        setTestResult(
          `Pending reminders: ${pending.length}`,
        );

        Alert.alert(
          'Pending Reminders',
          `${pending.length} registered\n\n${
            preview || 'No pending reminders'
          }`,
        );
      }
    } catch (error) {
      setTestResult(`Failed: ${error.message}`);

      Alert.alert(
        'Notification Test Failed',
        error.message,
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
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
          <Text style={styles.headerTitle}>
            Calendar
          </Text>

          <Text style={styles.headerSubtitle}>
            Plan your days
          </Text>
        </View>
      </View>

      {/* Calendar */}
      <Card>
        <View style={styles.monthRow}>
          <TouchableOpacity
            onPress={() => changeMonth(-1)}>

            <Text style={styles.arrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.month}>
            {month.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>

          <TouchableOpacity
            onPress={() => changeMonth(1)}>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
            (item, index) => (
              <Text
                key={index}
                style={styles.weekday}>
                {item}
              </Text>
            ),
          )}

          {cells.map((day, index) => {
            const date = day
              ? dateKey(
                  new Date(
                    month.getFullYear(),
                    month.getMonth(),
                    day,
                  ),
                )
              : '';

            const hasTask = tasks.some(
              task => task.date === date,
            );

            const past = date && date < todayKey;

            return (
              <TouchableOpacity
                key={index}
                disabled={!day}
                onPress={() => setSelected(date)}
                style={[
                  styles.cell,
                  date === selected && styles.current,
                ]}>

                <Text
                  style={[
                    styles.dayText,
                    past && styles.pastDay,
                    date === selected &&
                      styles.selectedDay,
                  ]}>
                  {day || ''}
                </Text>

                {hasTask && (
                  <View
                    style={[
                      styles.dot,
                      date === selected && {
                        backgroundColor: '#FFFFFF',
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Selected Day Tasks */}
      <View style={styles.tasksHeading}>
        <Text style={styles.heading}>
          Tasks for {selected}
        </Text>

        {!isPastDate && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}>

            <Text style={styles.addButtonText}>
              + Add Task
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isPastDate && (
        <Text style={styles.pastNotice}>
          Past dates are view-only.
        </Text>
      )}

      {selectedTasks.length === 0 ? (
        <Empty
          message="No tasks scheduled on this date."
        />
      ) : (
        selectedTasks.map(task => (
          <Card key={task.id}>
            <View style={styles.taskRow}>
              <TouchableOpacity
                onPress={() =>
                  handleToggleTask(task)
                }
                style={styles.checkButton}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: !!task.done,
                }}>

                <Text
                  style={[
                    styles.checkText,
                    task.done &&
                      styles.completedCheck,
                  ]}>
                  {task.done ? '✓' : '○'}
                </Text>
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.done &&
                      styles.completedTitle,
                  ]}>
                  {task.title}
                </Text>

                <Text style={styles.taskCategory}>
                  {task.category}
                  {task.time
                    ? `  •  ⏰ ${task.time}`
                    : ''}
                </Text>

                {task.done && (
                  <Text style={styles.completedLabel}>
                    Completed ✓
                  </Text>
                )}
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Notification Diagnostics */}
      <Card>
        <Text style={styles.heading}>
          Notification Test
        </Text>

        <Text style={styles.testDescription}>
          Check notification permission and reminders.
        </Text>

        <TouchableOpacity
          disabled={testing}
          style={styles.testButton}
          onPress={() => runTest('now')}>

          <Text style={styles.testButtonText}>
            Test Now
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={testing}
          style={styles.testButton}
          onPress={() => runTest('scheduled')}>

          <Text style={styles.testButtonText}>
            Test After 15 Sec
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={testing}
          style={styles.testButton}
          onPress={() => runTest('pending')}>

          <Text style={styles.testButtonText}>
            Check Pending Reminders
          </Text>
        </TouchableOpacity>

        {!!testResult && (
          <Text style={styles.testResult}>
            {testResult}
          </Text>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>

        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Add Task
            </Text>

            <Text style={styles.modalDate}>
              Selected date: {selected}
            </Text>

            <Text style={styles.label}>
              Task Name
            </Text>

            <TextInput
              style={styles.input}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter task name"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.label}>
              Category
            </Text>

            <View style={styles.categoryRow}>
              {categories.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryButton,
                    taskCategory === item &&
                      styles.activeCategory,
                  ]}
                  onPress={() =>
                    setTaskCategory(item)
                  }>

                  <Text
                    style={[
                      styles.categoryText,
                      taskCategory === item &&
                        styles.activeCategoryText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              Reminder Time (Optional)
            </Text>

            <TextInput
              style={styles.input}
              value={taskTime}
              onChangeText={setTaskTime}
              placeholder="HH:MM (e.g. 17:30)"
              placeholderTextColor={C.muted}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              disabled={saving}
              onPress={handleAddTask}>

              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Task'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={saving}
              onPress={closeModal}>

              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  arrow: {
    fontSize: 30,
    color: C.navy,
    paddingHorizontal: 10,
  },

  month: {
    fontSize: 20,
    fontWeight: '800',
    color: C.navy,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    color: C.muted,
    fontWeight: '700',
    marginBottom: 10,
  },

  cell: {
    width: '14.2857%',
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  current: {
    backgroundColor: C.navy,
  },

  dayText: {
    color: C.text,
    fontWeight: '600',
  },

  pastDay: {
    color: C.muted,
  },

  selectedDay: {
    color: '#FFFFFF',
  },

  dot: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E8A3B3',
  },

  tasksHeading: {
    marginTop: 22,
    marginBottom: 15,
    gap: 12,
  },

  heading: {
    fontSize: 19,
    color: C.text,
    fontWeight: '800',
  },

  addButton: {
    backgroundColor: C.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  pastNotice: {
    color: C.muted,
    marginBottom: 12,
    fontSize: 13,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkButton: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  checkText: {
    fontSize: 23,
    color: C.navy,
    fontWeight: '700',
  },

  completedCheck: {
    color: '#268A61',
  },

  taskInfo: {
    flex: 1,
  },

  taskTitle: {
    color: C.text,
    fontWeight: '700',
  },

  completedTitle: {
    textDecorationLine: 'line-through',
    color: C.muted,
  },

  taskCategory: {
    color: C.muted,
    marginTop: 6,
  },

  completedLabel: {
    color: '#268A61',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },

  testDescription: {
    color: C.muted,
    marginBottom: 12,
  },

  testButton: {
    backgroundColor: C.navy,
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 9,
  },

  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  testResult: {
    color: C.text,
    fontSize: 13,
    marginTop: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: C.text,
  },

  modalDate: {
    color: C.muted,
    marginTop: 7,
    marginBottom: 18,
  },

  label: {
    color: C.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 13,
  },

  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
    color: C.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },

  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  activeCategory: {
    backgroundColor: C.navy,
    borderColor: C.navy,
  },

  categoryText: {
    color: C.text,
  },

  activeCategoryText: {
    color: '#FFFFFF',
  },

  saveButton: {
    backgroundColor: C.navy,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  cancelText: {
    textAlign: 'center',
    color: C.muted,
    fontWeight: '600',
    marginTop: 18,
  },
});

export default CalendarScreen;
