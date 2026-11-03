
import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import C from '../units/Colors';
import {Empty} from './UI';

import {
  scheduleTaskNotification,
} from '../units/NotificationService';

const categories = [
  'Study',
  'Personal',
  'Habit',
  'Sport',
];

const filters = [
  'All',
  ...categories,
];

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const TodoScreen = ({
  tasks = [],
  onAdd,
  onToggle,
  onEdit,
  onNavigate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [filter, setFilter] = useState('All');
  const [taskTime, setTaskTime] = useState('17:30');
  const [saving, setSaving] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Personal');

  const today = getToday();

  // Today's Tasks Only
  const todayTasks = tasks.filter(
    task => task.date === today,
  );

  const selectedTask = tasks.find(
    task => task.id === selectedTaskId,
  );

  const filteredTasks = todayTasks.filter(task => {
    if (filter === 'All') return true;

    return task.category === filter;
  });

  // Open Bottom Sheet
  const openAddForm = () => {
    setMenuVisible(false);
    setSelectedTaskId(null);
    setShowAddForm(true);
  };

  // Close Bottom Sheet
  const closeAddForm = () => {
    if (saving) return;

    setShowAddForm(false);
    setTitle('');
    setTaskTime('17:30');
    setCategory('Personal');
  };

  // Back to Home
  const handleBackHome = () => {
    setShowAddForm(false);
    setSelectedTaskId(null);
    onNavigate?.('Home');
  };

  // Add Task
  const handleAdd = async () => {
    if (saving) return;

    if (!title.trim()) {
      Alert.alert(
        'Add a task',
        'Please enter a task name.',
      );
      return;
    }

    if (typeof onAdd !== 'function') {
      Alert.alert(
        'Error',
        'Task saving is not connected.',
      );
      return;
    }

    const validTime =
      /^([01]\d|2[0-3]):[0-5]\d$/.test(taskTime);

    if (!validTime) {
      Alert.alert(
        'Invalid Time',
        'Enter time in HH:MM format. Example: 17:30',
      );
      return;
    }

    const [hour, minute] = taskTime
      .split(':')
      .map(Number);

    const reminderDate = new Date();
    reminderDate.setHours(hour, minute, 0, 0);

    if (reminderDate.getTime() <= Date.now()) {
      Alert.alert(
        'Invalid Reminder',
        'Please select a future reminder time for today.',
      );
      return;
    }

    const taskId = `${Date.now()}-${Math.random()}`;
    const taskDate = getToday();

    setSaving(true);

    let notificationScheduled = false;
    let notificationError = null;

    try {
      await scheduleTaskNotification(
        taskId,
        title.trim(),
        taskDate,
        taskTime,
      );

      notificationScheduled = true;
    } catch (error) {
      notificationError =
        error?.message ||
        'Notification could not be scheduled.';

      console.error(
        'Notification Scheduling Error:',
        error,
      );
    }

    try {
      await Promise.resolve(
        onAdd(
          title.trim(),
          category,
          taskId,
          taskTime,
          taskDate,
        ),
      );

      // Reset and close sheet
      setTitle('');
      setCategory('Personal');
      setTaskTime('17:30');
      setShowAddForm(false);
      setFilter('All');

      if (notificationScheduled) {
        Alert.alert(
          'Success',
          'Task added successfully! Reminder scheduled.',
        );
      } else {
        Alert.alert(
          'Task Added',
          `Task added, but reminder was not scheduled.\n\n${notificationError}`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Task Error',
        error?.message || 'Unable to add task.',
      );
    } finally {
      setSaving(false);
    }
  };

  // Long Press Task
  const handleLongPress = task => {
    setSelectedTaskId(task.id);
    setMenuVisible(false);
  };

  // Edit Selected Task
  const startEditing = () => {
    setMenuVisible(false);

    if (!selectedTask) {
      Alert.alert(
        'Select Task',
        'First long press a task to select it.',
      );
      return;
    }

    setEditTitle(selectedTask.title);
    setEditCategory(selectedTask.category);
    setEditVisible(true);
  };

  const saveEditedTask = () => {
    if (!selectedTask) {
      setEditVisible(false);
      return;
    }

    if (!editTitle.trim()) {
      Alert.alert(
        'Invalid Task',
        'Please enter a task name.',
      );
      return;
    }

    if (typeof onEdit !== 'function') {
      Alert.alert(
        'Error',
        'Task editing is not connected.',
      );
      return;
    }

    onEdit(
      selectedTask.id,
      editTitle.trim(),
      editCategory,
    );

    setEditVisible(false);
    setSelectedTaskId(null);

    Alert.alert(
      'Success',
      'Task updated successfully!',
    );
  };

  const cancelSelection = () => {
    setSelectedTaskId(null);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>

      {/* Main Task Screen */}
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Back Header */}
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
              To-Do List
            </Text>

            <Text style={styles.headerSubtitle}>
              Organize your day
            </Text>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.tasksHeader}>
          <View style={styles.tasksHeading}>
            <Text style={styles.section}>
              {selectedTaskId
                ? '1 Task Selected'
                : `Today's Tasks (${filteredTasks.length})`}
            </Text>

            {selectedTaskId && (
              <TouchableOpacity
                onPress={cancelSelection}>

                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.dotsButton}
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Task options">

            <Text style={styles.dotsText}>
              ⋮
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}>

          {filters.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                filter === item && styles.selected,
              ]}
              onPress={() => {
                setFilter(item);
                cancelSelection();
              }}>

              <Text
                style={[
                  styles.chipText,
                  filter === item && styles.selectedText,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              📝
            </Text>

            <Text style={styles.emptyTitle}>
              No tasks for today
            </Text>

            <Text style={styles.emptySubtitle}>
              Add your first task to get started.
            </Text>
          </View>
        ) : (
          filteredTasks.map(task => {
            const isSelected =
              selectedTaskId === task.id;

            return (
              <Pressable
                key={task.id}
                onLongPress={() => handleLongPress(task)}
                delayLongPress={450}
                onPress={() => {
                  if (selectedTaskId !== null) {
                    setSelectedTaskId(
                      isSelected ? null : task.id,
                    );
                  }
                }}
                style={[
                  styles.task,
                  isSelected && styles.selectedTask,
                ]}>

                <TouchableOpacity
                  style={styles.check}
                  onPress={() => {
                    if (selectedTaskId !== null) {
                      setSelectedTaskId(task.id);
                    } else {
                      onToggle?.(task.id);
                    }
                  }}>

                  <Text style={styles.checkText}>
                    {task.done ? '☑' : '☐'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.done && styles.completedTask,
                    ]}>
                    {task.title}
                  </Text>

                  <Text style={styles.meta}>
                    {task.category} • {task.date}
                  </Text>

                  {task.time ? (
                    <Text style={styles.reminderText}>
                      ⏰ {task.time}
                    </Text>
                  ) : null}
                </View>

                {isSelected && (
                  <Text style={styles.selectedBadge}>
                    Selected
                  </Text>
                )}
              </Pressable>
            );
          })
        )}

        <Text style={styles.longPressHint}>
          Long press a task to select and edit it.
        </Text>
      </ScrollView>

      {/* Fixed Bottom Add Task Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={openAddForm}
          activeOpacity={0.85}>

          <Text style={styles.floatingAddText}>
            + Add Task
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Bottom Sheet */}
      <Modal
        visible={showAddForm}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeAddForm}>

        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* Dark Background */}
          <Pressable
            style={styles.sheetBackdrop}
            onPress={closeAddForm}
          />

          {/* Bottom Sheet */}
          <View style={styles.bottomSheet}>

            <View style={styles.sheetHandle} />

            <View style={styles.formHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  Add New Task
                </Text>

                <Text style={styles.sheetSubtitle}>
                  Create a task for today
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeAddForm}
                disabled={saving}
                style={styles.closeFormButton}>

                <Text style={styles.closeFormText}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScrollContent}>

              {/* Task Name */}
              <Text style={styles.label}>
                Task Name
              </Text>

              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="What do you need to do?"
                placeholderTextColor={C.muted}
                returnKeyType="done"
              />

              {/* Reminder Time */}
              <Text style={styles.timeLabel}>
                ⏰ Reminder Time (24-hour format)
              </Text>

              <TextInput
                value={taskTime}
                onChangeText={setTaskTime}
                placeholder="17:30"
                placeholderTextColor={C.muted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={styles.input}
              />

              <Text style={styles.hint}>
                Example: 09:30 = 9:30 AM,
                17:30 = 5:30 PM.
              </Text>

              {/* Categories */}
              <Text style={styles.categoryLabel}>
                Category
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}>

                {categories.map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.chip,
                      category === item &&
                        styles.selected,
                    ]}>

                    <Text
                      style={[
                        styles.chipText,
                        category === item &&
                          styles.selectedText,
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                style={[
                  styles.sheetSaveButton,
                  saving && styles.disabledButton,
                ]}
                disabled={saving}
                onPress={handleAdd}>

                <Text style={styles.sheetSaveText}>
                  {saving
                    ? 'Saving Task...'
                    : '✓ Save Task'}
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Task Options Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>

        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}>

          <View style={styles.menuCard}>
            <Text style={styles.menuHeading}>
              Task Options
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={startEditing}>

              <Text style={styles.menuItemText}>
                ✏️ Edit Selected Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={cancelSelection}>

              <Text style={styles.menuItemText}>
                ✕ Cancel Selection
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMenuVisible(false)}>

              <Text style={styles.closeMenu}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}>

        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Edit Task
            </Text>

            <Text style={styles.label}>
              Task Name
            </Text>

            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter task name"
              placeholderTextColor={C.muted}
            />

            <Text style={styles.categoryLabel}>
              Category
            </Text>

            <View style={styles.categoryRow}>
              {categories.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    editCategory === item &&
                      styles.selected,
                  ]}
                  onPress={() =>
                    setEditCategory(item)
                  }>

                  <Text
                    style={[
                      styles.chipText,
                      editCategory === item &&
                        styles.selectedText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveEditedTask}>

              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEditVisible(false)}>

              <Text style={styles.cancelModal}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },

  page: {
    flex: 1,
    backgroundColor: C.background,
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  // Back Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 25,
  },

  floatingBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
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
  },

  // Tasks Header
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  tasksHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },

  section: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },

  dotsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dotsText: {
    color: C.navy,
    fontSize: 30,
    fontWeight: '800',
  },

  cancelText: {
    color: C.navy,
    fontWeight: '700',
  },

  // Filters
  filters: {
    marginBottom: 18,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
    marginBottom: 5,
  },

  selected: {
    backgroundColor: C.navy,
    borderColor: C.navy,
  },

  chipText: {
    color: C.text,
  },

  selectedText: {
    color: '#FFFFFF',
  },

  // Task Card
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 90,
  },

  selectedTask: {
    backgroundColor: C.mint,
    borderColor: C.navy,
  },

  check: {
    padding: 4,
  },

  checkText: {
    fontSize: 22,
    color: C.navy,
  },

  taskInfo: {
    flex: 1,
  },

  taskTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },

  completedTask: {
    textDecorationLine: 'line-through',
    color: C.muted,
  },

  meta: {
    color: C.muted,
    fontSize: 11,
    marginTop: 4,
  },

  reminderText: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },

  selectedBadge: {
    color: C.navy,
    fontSize: 11,
    fontWeight: '700',
  },

  longPressHint: {
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    marginTop: 15,
  },

  // Empty State
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 45,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },

  emptySubtitle: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  // Fixed Bottom Button
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: C.background,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  floatingAddButton: {
    backgroundColor: C.navy,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  floatingAddText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Bottom Sheet
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 24,
    maxHeight: '85%',
    elevation: 15,
  },

  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 20,
  },

  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },

  sheetSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 4,
  },

  closeFormButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeFormText: {
    fontSize: 20,
    color: C.muted,
  },

  sheetScrollContent: {
    paddingBottom: 8,
  },

  label: {
    fontWeight: '700',
    color: C.text,
    marginBottom: 9,
  },

  timeLabel: {
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
    marginBottom: 9,
  },

  input: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 13,
    color: C.text,
  },

  hint: {
    fontSize: 11,
    color: C.muted,
    marginTop: 7,
  },

  categoryLabel: {
    fontWeight: '700',
    color: C.text,
    marginTop: 20,
    marginBottom: 12,
  },

  categoryScroll: {
    marginBottom: 20,
  },

  sheetSaveButton: {
    backgroundColor: C.navy,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  sheetSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.5,
  },

  // Task Options
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 120,
    paddingRight: 22,
  },

  menuCard: {
    backgroundColor: '#FFFFFF',
    width: 230,
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },

  menuHeading: {
    fontWeight: '800',
    fontSize: 16,
    color: C.text,
    marginBottom: 12,
  },

  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  menuItemText: {
    color: C.text,
    fontSize: 14,
  },

  closeMenu: {
    textAlign: 'center',
    color: C.muted,
    marginTop: 15,
  },

  // Edit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
    marginBottom: 15,
  },

  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: C.navy,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  cancelModal: {
    textAlign: 'center',
    color: C.muted,
    marginTop: 18,
    fontWeight: '600',
  },
});

export default TodoScreen;
