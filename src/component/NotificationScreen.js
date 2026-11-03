
import React, {useState} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

import C from '../units/Colors';

const NotificationScreen = ({
  tasks = [],
  onBack,
  onViewTasks,
}) => {
  const [readIds, setReadIds] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);

  const notifications = tasks.map(task => ({
    id: String(task.id),
    title: task.done
      ? '✅ Task Completed'
      : task.time
        ? '⏰ Task Reminder'
        : '📋 Pending Task',
    message: task.done
      ? `You completed: ${task.title}`
      : task.time
        ? `${task.title} is scheduled for ${task.time}`
        : `Don't forget: ${task.title}`,
    read: readIds.includes(String(task.id)),
  }));

  const visibleNotifications = notifications.filter(
    item => !deletedIds.includes(item.id),
  );

  const unreadCount = visibleNotifications.filter(
    item => !item.read,
  ).length;

  const markAsRead = id => {
    setReadIds(previous =>
      previous.includes(id)
        ? previous
        : [...previous, id],
    );
  };

  const markAllAsRead = () => {
    setReadIds(
      visibleNotifications.map(item => item.id),
    );
  };

  const deleteNotification = id => {
    setDeletedIds(previous => [...previous, id]);
  };

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
            Notifications 🔔
          </Text>

          <Text style={styles.headerSubtitle}>
            {unreadCount} unread notifications
          </Text>
        </View>
      </View>

      {/* Mark All as Read */}
      {visibleNotifications.length > 0 && (
        <TouchableOpacity
          onPress={markAllAsRead}
          style={styles.markAllButton}
          activeOpacity={0.7}>

          <Text style={styles.markAllText}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}

      {/* Notification List */}
      {visibleNotifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>
            🔔
          </Text>

          <Text style={styles.emptyTitle}>
            No notifications
          </Text>

          <Text style={styles.emptyText}>
            Your task updates will appear here.
          </Text>
        </View>
      ) : (
        visibleNotifications.map(item => (
          <View
            key={item.id}
            style={[
              styles.notificationCard,
              !item.read && styles.unreadCard,
            ]}>

            <TouchableOpacity
              style={styles.notificationBody}
              onPress={() => {
                markAsRead(item.id);
                onViewTasks?.();
              }}
              activeOpacity={0.7}>

              <Text style={styles.notificationTitle}>
                {item.title}
              </Text>

              <Text style={styles.notificationMessage}>
                {item.message}
              </Text>

              <Text style={styles.status}>
                {item.read ? 'Read' : 'Unread'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                deleteNotification(item.id)
              }
              style={styles.deleteButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Delete notification">

              <Text style={styles.deleteText}>
                🗑️
              </Text>
            </TouchableOpacity>
          </View>
        ))
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

  // Mark All as Read
  markAllButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    paddingVertical: 6,
  },

  markAllText: {
    color: C.navy,
    fontWeight: '700',
    fontSize: 13,
  },

  // Notification Cards
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },

  unreadCard: {
    backgroundColor: C.mint,
    borderColor: '#BCE5E1',
  },

  notificationBody: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },

  notificationMessage: {
    fontSize: 13,
    color: C.muted,
    marginTop: 7,
    lineHeight: 19,
  },

  status: {
    fontSize: 12,
    color: C.navy,
    marginTop: 9,
  },

  deleteButton: {
    padding: 8,
  },

  deleteText: {
    fontSize: 20,
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 35,
    borderRadius: 20,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },

  emptyText: {
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    marginTop: 9,
  },
});

export default NotificationScreen;
