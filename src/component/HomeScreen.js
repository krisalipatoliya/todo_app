
import React, {
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  AppState,
} from 'react-native';

import C from '../units/Colors';
import {ProgressBar} from './UI';

// Home modules
const modules = [
  ['💰', 'Savings Planner'],
  ['🧠', 'Mental Wellness'],
  ['⏱', 'Timer'],
  ['🎯', 'Goal Tracker'],
  ['🌙', 'Sleep Tracker'],
  ['📅', 'Calendar'],
];

const categories = [
  'Study',
  'Personal',
  'Habit',
  'Sport',
];

const weekdays = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

// Pop Up Animation for Home Modules
const PopUpModule = memo(({
  index,
  onPress,
  children,
}) => {
  const scaleAnim = useRef(
    new Animated.Value(0.3),
  ).current;

  const opacityAnim = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(index * 110),

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 65,
          useNativeDriver: true,
        }),

        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    return () => animation.stop();
  }, [index, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.module,
        {
          opacity: opacityAnim,
          transform: [
            {scale: scaleAnim},
          ],
        },
      ]}>

      <TouchableOpacity
        style={styles.moduleTouch}
        activeOpacity={0.8}
        onPress={onPress}>

        {children}

      </TouchableOpacity>

    </Animated.View>
  );
});

// Fast animated date card
const DateCard = memo(({
  day,
  weekday,
  width,
  isSelected,
  isToday,
  onPress,
}) => {
  const scaleAnim = useRef(
    new Animated.Value(isSelected ? 1.13 : 1),
  ).current;

  useEffect(() => {
    const animation = Animated.timing(scaleAnim, {
      toValue: isSelected ? 1.13 : 1,
      duration: 65,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [isSelected, scaleAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(day)}
      style={[
        styles.dateSlot,
        {width},
      ]}>

      <Animated.View
        style={[
          styles.date,
          isSelected && styles.activeDate,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>

        <Text style={styles.weekday}>
          {weekday}
        </Text>

        <Text
          style={[
            styles.day,
            isSelected && styles.selectedDayText,
          ]}>
          {day}
        </Text>

        {isToday && (
          <View style={styles.todayDot} />
        )}

      </Animated.View>
    </TouchableOpacity>
  );
});

const HomeScreen = ({
  tasks = [],
  onNavigate,
  onModule,
  onProfile,
  onNotification,
  notificationEventId = 0,
  userName = 'User',
}) => {
  // Animations
  const waveAnim = useRef(
    new Animated.Value(0),
  ).current;

  const bellAnim = useRef(
    new Animated.Value(0),
  ).current;

  const bellAnimationRef = useRef(null);

  const lastNotificationId = useRef(
    notificationEventId,
  );

  // Calendar references
  const dateListRef = useRef(null);

  const [today, setToday] = useState(
    new Date(),
  );

  const [calendarWidth, setCalendarWidth] = useState(0);

  const [selectedDay, setSelectedDay] = useState(
    new Date().getDate(),
  );

  const selectedDayRef = useRef(
    new Date().getDate(),
  );

  // Current month details
  const year = today.getFullYear();
  const monthNumber = today.getMonth();
  const currentDay = today.getDate();

  const daysInMonth = new Date(
    year,
    monthNumber + 1,
    0,
  ).getDate();

  const days = Array.from(
    {length: daysInMonth},
    (_, index) => ({
      day: index + 1,
      weekday: weekdays[
        new Date(
          year,
          monthNumber,
          index + 1,
        ).getDay()
      ],
    }),
  );

  const currentMonth = today.toLocaleString(
    'en-US',
    {month: 'short'},
  );

  const monthKey = `${year}-${monthNumber}`;

  // Seven dates visible at once
  const ITEM_WIDTH =
    calendarWidth > 0
      ? calendarWidth / 7
      : 48;

  // Three slots before and after center
  const SIDE_PADDING = ITEM_WIDTH * 3;

  // Update date when a new day starts
  const refreshDate = () => {
    const now = new Date();

    setToday(previous => {
      const dayChanged =
        previous.getDate() !== now.getDate() ||
        previous.getMonth() !== now.getMonth() ||
        previous.getFullYear() !== now.getFullYear();

      if (dayChanged) {
        selectedDayRef.current = now.getDate();
        setSelectedDay(now.getDate());
      }

      return dayChanged ? now : previous;
    });
  };

  useEffect(() => {
    const interval = setInterval(
      refreshDate,
      60000,
    );

    const subscription = AppState.addEventListener(
      'change',
      state => {
        if (state === 'active') {
          refreshDate();
        }
      },
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  // Waving hand animation
  useEffect(() => {
    const wave = Animated.sequence([
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(waveAnim, {
        toValue: -1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(waveAnim, {
        toValue: -1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(waveAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    wave.start();

    return () => wave.stop();
  }, [waveAnim]);

  // Bell rings on a new notification
  useEffect(() => {
    if (
      notificationEventId ===
      lastNotificationId.current
    ) {
      return;
    }

    lastNotificationId.current =
      notificationEventId;

    bellAnimationRef.current?.stop();
    bellAnim.setValue(0);

    const ring = Animated.sequence([
      Animated.timing(bellAnim, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }),

      Animated.timing(bellAnim, {
        toValue: -1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(bellAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(bellAnim, {
        toValue: -1,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(bellAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    bellAnimationRef.current = ring;
    ring.start();

    return () => ring.stop();
  }, [notificationEventId, bellAnim]);

  const rotate = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [
      '-18deg',
      '0deg',
      '25deg',
    ],
  });

  const bellRotate = bellAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [
      '-20deg',
      '0deg',
      '20deg',
    ],
  });

  // Update selected day only when it changes
  const updateSelectedDay = day => {
    const safeDay = Math.max(
      1,
      Math.min(daysInMonth, day),
    );

    if (selectedDayRef.current !== safeDay) {
      selectedDayRef.current = safeDay;
      setSelectedDay(safeDay);
    }
  };

  // Instant date positioning on tap
  const scrollToDay = day => {
    if (calendarWidth <= 0) {
      return;
    }

    updateSelectedDay(day);

    dateListRef.current?.scrollToOffset({
      offset: (day - 1) * ITEM_WIDTH,
      animated: false,
    });
  };

  // Center current date when calendar opens
  useEffect(() => {
    if (calendarWidth <= 0) {
      return;
    }

    updateSelectedDay(currentDay);

    dateListRef.current?.scrollToOffset({
      offset: (currentDay - 1) * ITEM_WIDTH,
      animated: false,
    });
  }, [
    calendarWidth,
    currentDay,
    monthKey,
  ]);

  // Fast selection while scrolling
  const handleDateScroll = event => {
    if (calendarWidth <= 0) {
      return;
    }

    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(
      offsetX / ITEM_WIDTH,
    );

    updateSelectedDay(index + 1);
  };

  const completed = tasks.filter(
    task => task.done,
  ).length;

  const progress = tasks.length
    ? Math.round(
        (completed / tasks.length) * 100,
      )
    : 0;

  const displayName =
    typeof userName === 'string' &&
    userName.trim()
      ? userName.trim().split(/\s+/)[0]
      : 'User';

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Home Header */}
      <View style={styles.hero}>
        <View style={styles.headerRow}>

          <View style={styles.greetingContainer}>
            <View style={styles.greetingRow}>
              <Text
                style={styles.greeting}
                numberOfLines={1}>
                Hello, {displayName}
              </Text>

              <Animated.Text
                style={[
                  styles.waveIcon,
                  {
                    transform: [{rotate}],
                  },
                ]}>
                👋
              </Animated.Text>
            </View>

            <Text style={styles.subtitle}>
              Make today a little better
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={onNotification}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open Notifications">

              <Animated.Text
                style={[
                  styles.bellIcon,
                  {
                    transform: [
                      {rotate: bellRotate},
                    ],
                  },
                ]}>
                🔔
              </Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={onProfile}
              accessibilityRole="button"
              accessibilityLabel="Open My Profile">

              <Text style={styles.profileIcon}>
                👤
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fast Scrollable Calendar */}
        <View
          style={styles.calendarContainer}
          onLayout={event => {
            const width =
              event.nativeEvent.layout.width;

            if (
              width > 0 &&
              Math.abs(width - calendarWidth) > 0.5
            ) {
              setCalendarWidth(width);
            }
          }}>

          {calendarWidth > 0 && (
            <FlatList
              key={monthKey}
              ref={dateListRef}
              horizontal
              data={days}
              extraData={selectedDay}
              keyExtractor={item =>
                String(item.day)
              }
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              snapToAlignment="start"
              decelerationRate="fast"
              scrollEventThrottle={16}
              onScroll={handleDateScroll}
              initialScrollIndex={currentDay - 1}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
              contentContainerStyle={{
                paddingHorizontal: SIDE_PADDING,
              }}
              renderItem={({item}) => (
                <DateCard
                  day={item.day}
                  weekday={item.weekday}
                  width={ITEM_WIDTH}
                  isToday={item.day === currentDay}
                  isSelected={
                    item.day === selectedDay
                  }
                  onPress={scrollToDay}
                />
              )}
            />
          )}
        </View>

        {/* Progress */}
        <Text style={styles.progressLabel}>
          Today's Progress   {progress}%
        </Text>

        <ProgressBar progress={progress} />
      </View>

      {/* Modules - Pop Up Animation */}
      <View style={styles.modules}>
        {modules.map(([icon, label], index) => (
          <PopUpModule
            key={label}
            index={index}
            onPress={() =>
              label === 'Calendar'
                ? onNavigate?.('Calendar')
                : onModule?.(label)
            }>

            <View style={styles.moduleIcon}>
              {label === 'Calendar' ? (
                <View style={styles.calendarIcon}>
                  <Text style={styles.calendarMonth}>
                    {currentMonth}
                  </Text>

                  <Text style={styles.calendarDay}>
                    {currentDay}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.moduleEmoji,
                    label === 'Timer' &&
                      styles.timerEmoji,
                  ]}>
                  {icon}
                </Text>
              )}
            </View>

            <Text style={styles.moduleLabel}>
              {label}
            </Text>

          </PopUpModule>
        ))}
      </View>

      {/* Tasks Header */}
      <View style={styles.heading}>
        <Text style={styles.headingText}>
          Today's Tasks
        </Text>

        <TouchableOpacity
          onPress={() =>
            onNavigate?.('To-Do')
          }>

          <Text style={styles.link}>
            View all →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Categories */}
      <View style={styles.categories}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={styles.category}
            onPress={() =>
              onNavigate?.('To-Do')
            }>

            <Text style={styles.categoryEmoji}>
              {
                ['📚', '🩷', '🌱', '🏃'][index]
              }
            </Text>

            <Text style={styles.categoryName}>
              {category}
            </Text>

            <Text style={styles.count}>
              {
                tasks.filter(
                  task =>
                    task.category === category &&
                    !task.done,
                ).length
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingBottom: 32,
  },

  hero: {
    backgroundColor: C.mint,
    padding: 22,
    paddingTop: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  greetingContainer: {
    flex: 1,
    marginRight: 10,
  },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greeting: {
    fontSize: 25,
    fontWeight: '800',
    color: C.text,
    flexShrink: 1,
  },

  waveIcon: {
    fontSize: 28,
    marginLeft: 8,
  },

  subtitle: {
    fontSize: 14,
    color: C.muted,
    marginTop: 5,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bellIcon: {
    fontSize: 25,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D5E9E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 24,
  },

  // Calendar container
  calendarContainer: {
    width: '100%',
    height: 105,
    marginBottom: 24,
    overflow: 'hidden',
  },

  dateSlot: {
    height: 105,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Normal date card
  date: {
    width: '100%',
    height: 73,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CEEBE8',
    backgroundColor: C.mint,
  },

  // Center selected card
  activeDate: {
    backgroundColor: C.green,
    borderColor: '#A8D9B1',
  },

  weekday: {
    fontSize: 10,
    color: C.muted,
  },

  day: {
    fontSize: 19,
    fontWeight: '700',
    color: C.text,
    marginTop: 5,
  },

  selectedDayText: {
    fontSize: 23,
    fontWeight: '800',
  },

  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.navy,
    marginTop: 4,
  },

  progressLabel: {
    textAlign: 'center',
    color: C.navy,
    fontWeight: '700',
    marginBottom: 8,
  },

  // Modules
  modules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 30,
    backgroundColor: '#E9E7FF',
  },

  module: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 26,
  },

  // Added for Pop Up Module
  moduleTouch: {
    width: '100%',
    alignItems: 'center',
  },

  moduleIcon: {
    width: 75,
    height: 75,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moduleEmoji: {
    fontSize: 34,
  },

  timerEmoji: {
    fontSize: 52,
  },

  calendarIcon: {
    width: 48,
    height: 51,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E5EF',
    borderRadius: 7,
    overflow: 'hidden',
    alignItems: 'center',
  },

  calendarMonth: {
    width: '100%',
    backgroundColor: '#F04452',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    paddingVertical: 3,
  },

  calendarDay: {
    fontSize: 21,
    fontWeight: '900',
    color: '#26344B',
    marginTop: 2,
  },

  moduleLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: C.text,
    marginTop: 9,
  },

  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 8,
    marginBottom: 12,
  },

  headingText: {
    fontSize: 21,
    fontWeight: '800',
    color: C.text,
  },

  link: {
    color: C.navy,
    fontWeight: '700',
  },

  categories: {
    backgroundColor: C.pink,
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  category: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 13,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  categoryEmoji: {
    fontSize: 19,
  },

  categoryName: {
    flex: 1,
    color: C.text,
    fontSize: 13,
  },

  count: {
    color: C.muted,
    fontSize: 12,
  },
});

export default HomeScreen;
