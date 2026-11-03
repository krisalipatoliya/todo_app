
import React, {useEffect, useState, useRef} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  AppState,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import notifee, {EventType} from '@notifee/react-native';

import C from './units/Colors';

import HomeScreen from './component/HomeScreen';
import TodoScreen from './component/TodoScreen';
import CalendarScreen from './component/CalendarScreen';
import ProgressScreen from './component/ProgressScreen';
import SettingsScreen from './component/SettingsScreen';
import ModuleScreen from './component/ModuleScreen';
import SavingsPlannerScreen from './component/SavingsPlannerScreen';
import MentalWellnessScreen from './component/MentalWellnessScreen';
import TimerScreen from './component/TimerScreen';
import GoalTrackerScreen from './component/GoalTrackerScreen';
import SleepTrackerScreen from './component/SleepTrackerScreen';
import ProfileScreen from './component/ProfileScreen';
import NotificationScreen from './component/NotificationScreen';

// Today's local date
const getToday = () => {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

// New user gets an empty task list
const createInitialTasks = () => [];

// Previous built-in demo tasks
const DEMO_TASKS = {
  '1': {
    title: 'Read for 20 minutes',
    category: 'Study',
  },
  '2': {
    title: 'Drink enough water',
    category: 'Habit',
  },
  '3': {
    title: 'Go for a walk',
    category: 'Sport',
  },
  '4': {
    title: 'Plan tomorrow',
    category: 'Personal',
  },
};

// Remove only original demo tasks
const removeOldDemoTasks = savedTasks => {
  if (!Array.isArray(savedTasks)) {
    return [];
  }

  return savedTasks.filter(task => {
    if (!task || typeof task !== 'object') {
      return false;
    }

    const demo = DEMO_TASKS[String(task.id)];

    if (!demo) {
      return true;
    }

    const isOriginalDemo =
      task.title === demo.title &&
      task.category === demo.category &&
      (task.time === null || task.time === undefined);

    return !isOriginalDemo;
  });
};

// Bottom navigation
const tabs = [
  {name: 'Home', icon: '⌂'},
  {name: 'To-Do', icon: '☑'},
  {name: 'Calendar', icon: '▦'},
  {name: 'Progress', icon: '▥'},
  {name: 'Settings', icon: '⚙'},
];

const MainApp = ({
  user,
  onLogout,
  onUserUpdate,
}) => {
  // All hooks remain at component top level
  const [activeTab, setActiveTab] = useState('Home');
  const [activeModule, setActiveModule] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  const [
    notificationEventId,
    setNotificationEventId,
  ] = useState(0);

  const activeTabRef = useRef(activeTab);
  const activeModuleRef = useRef(activeModule);
  const appStateRef = useRef(AppState.currentState);
  const loadedTasksKeyRef = useRef(null);

  activeTabRef.current = activeTab;
  activeModuleRef.current = activeModule;

  // Mobile Number Login:
  // Each phone number has separate saved tasks.
  // Email remains as fallback for older accounts.
  const userKey = String(
    user?.phone ||
      user?.email ||
      user?.name ||
      'default',
  )
    .trim()
    .toLowerCase();

  const TASKS_KEY = `@todo_app_tasks_${userKey}`;

  // Notification event listener
  useEffect(() => {
    const appStateSubscription =
      AppState.addEventListener(
        'change',
        nextState => {
          appStateRef.current = nextState;
        },
      );

    const unsubscribe = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type !== EventType.DELIVERED) {
          return;
        }

        console.log(
          'Notification delivered:',
          detail.notification?.title,
        );

        if (
          appStateRef.current === 'active' &&
          activeTabRef.current === 'Home' &&
          activeModuleRef.current === null
        ) {
          setNotificationEventId(
            previous => previous + 1,
          );
        }
      },
    );

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  // Load tasks for current user
  useEffect(() => {
    let mounted = true;

    loadedTasksKeyRef.current = null;
    setTasksLoaded(false);

    const loadTasks = async () => {
      try {
        const savedTasks =
          await AsyncStorage.getItem(TASKS_KEY);

        if (!mounted) {
          return;
        }

        let restoredTasks = createInitialTasks();

        if (savedTasks !== null) {
          const parsedTasks = JSON.parse(savedTasks);

          restoredTasks = removeOldDemoTasks(
            parsedTasks,
          );
        }

        if (!mounted) {
          return;
        }

        // Migrate old demo entries while
        // keeping user-created tasks.
        await AsyncStorage.setItem(
          TASKS_KEY,
          JSON.stringify(restoredTasks),
        );

        if (!mounted) {
          return;
        }

        setTasks(restoredTasks);
        loadedTasksKeyRef.current = TASKS_KEY;
        setTasksLoaded(true);
      } catch (error) {
        console.log('Load tasks error:', error);

        if (mounted) {
          setTasks([]);
          loadedTasksKeyRef.current = null;
          setTasksLoaded(true);
        }
      }
    };

    loadTasks();

    return () => {
      mounted = false;
    };
  }, [TASKS_KEY]);

  // Save tasks automatically
  useEffect(() => {
    if (
      !tasksLoaded ||
      loadedTasksKeyRef.current !== TASKS_KEY
    ) {
      return;
    }

    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(
          TASKS_KEY,
          JSON.stringify(tasks),
        );
      } catch (error) {
        console.log('Save tasks error:', error);
      }
    };

    saveTasks();
  }, [tasks, tasksLoaded, TASKS_KEY]);

  // Add Task
  const addTask = (
    title,
    category,
    taskId,
    taskTime,
    taskDate = getToday(),
  ) => {
    const newTask = {
      id:
        taskId ||
        `${Date.now()}-${Math.random()}`,
      title,
      category,
      date: taskDate,
      time: taskTime || null,
      done: false,
    };

    setTasks(previous => [
      newTask,
      ...previous,
    ]);
  };

  // Toggle Task
  const toggleTask = id => {
    setTasks(previous =>
      previous.map(task =>
        task.id === id
          ? {
              ...task,
              done: !task.done,
            }
          : task,
      ),
    );
  };

  // Edit Task
  const editTask = (
    id,
    updatedTitle,
    updatedCategory,
  ) => {
    setTasks(previous =>
      previous.map(task =>
        task.id === id
          ? {
              ...task,
              title: updatedTitle,
              category: updatedCategory,
            }
          : task,
      ),
    );
  };

  // Navigate to main tab
  const navigate = screen => {
    setActiveModule(null);
    setActiveTab(screen);
  };

  // Profile
  const openProfile = () => {
    setActiveModule('My Profile');
  };

  const closeProfile = () => {
    setActiveModule(null);
  };

  // Notifications
  const openNotifications = () => {
    setActiveModule('Notifications');
  };

  const closeNotifications = () => {
    setActiveModule(null);
    setActiveTab('Home');
  };

  const openTasksFromNotification = () => {
    setActiveModule(null);
    setActiveTab('To-Do');
  };

  // Update Profile
  const handleProfileUpdate = updatedProfile => {
    onUserUpdate?.(updatedProfile);
  };

  // Screen navigation
  const renderScreen = () => {
    if (activeModule === 'Savings Planner') {
      return (
        <SavingsPlannerScreen
          onBack={() => setActiveModule(null)}
        />
      );
    }

    if (activeModule === 'Mental Wellness') {
      return (
        <MentalWellnessScreen
          onBack={() => setActiveModule(null)}
        />
      );
    }

    if (activeModule === 'Timer') {
      return (
        <TimerScreen
          onBack={() => setActiveModule(null)}
        />
      );
    }

    if (activeModule === 'Goal Tracker') {
      return (
        <GoalTrackerScreen
          onBack={() => setActiveModule(null)}
        />
      );
    }

    if (activeModule === 'Sleep Tracker') {
      return (
        <SleepTrackerScreen
          onBack={() => setActiveModule(null)}
        />
      );
    }

    if (activeModule === 'My Profile') {
      return (
        <ProfileScreen
          user={user}
          tasks={tasks}
          onProfileUpdate={handleProfileUpdate}
          onBack={closeProfile}
        />
      );
    }

    if (activeModule === 'Notifications') {
      return (
        <NotificationScreen
          tasks={tasks}
          onBack={closeNotifications}
          onViewTasks={openTasksFromNotification}
        />
      );
    }

    if (activeModule) {
      return (
        <ModuleScreen
          title={activeModule}
          onBack={() => setActiveModule(null)}
        />
      );
    }

    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen
            tasks={tasks}
            onNavigate={navigate}
            onModule={setActiveModule}
            onProfile={openProfile}
            onNotification={openNotifications}
            notificationEventId={notificationEventId}
            userName={user?.name || 'User'}
          />
        );

      case 'To-Do':
        return (
          <TodoScreen
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onEdit={editTask}
            onNavigate={navigate}
          />
        );

      case 'Calendar':
        return (
          <CalendarScreen
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onNavigate={navigate}
          />
        );

      case 'Progress':
        return (
          <ProgressScreen
            tasks={tasks}
            onNavigate={navigate}
          />
        );

      case 'Settings':
        return (
          <SettingsScreen
            tasks={tasks}
            onLogout={onLogout}
            onProfile={openProfile}
            onNavigate={navigate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}>

      <StatusBar
        backgroundColor={C.mint}
        barStyle="dark-content"
      />

      {!tasksLoaded ||
      loadedTasksKeyRef.current !== TASKS_KEY ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={C.navy}
          />

          <Text style={styles.loadingText}>
            Loading your tasks...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.screen}>
            {renderScreen()}
          </View>

          {!activeModule && (
            <View style={styles.bottomBar}>
              {tabs.map(tab => (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tab}
                  onPress={() => navigate(tab.name)}
                  activeOpacity={0.8}>

                  <Text
                    style={[
                      styles.tabIcon,
                      activeTab === tab.name &&
                        styles.active,
                    ]}>
                    {tab.icon}
                  </Text>

                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab.name &&
                        styles.active,
                    ]}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.background,
  },

  loadingText: {
    marginTop: 12,
    color: C.muted,
    fontSize: 14,
  },

  bottomBar: {
    height: 70,
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabIcon: {
    fontSize: 24,
    color: '#B8C4DC',
  },

  tabLabel: {
    fontSize: 10,
    color: '#B8C4DC',
    marginTop: 4,
  },

  active: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default MainApp;
