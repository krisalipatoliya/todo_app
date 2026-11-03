
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import C from '../units/Colors';

export const Header = ({title, subtitle, right}) => {
  return (
    <View style={styles.header}>
      <View style={{flex: 1}}>
        <Text style={styles.title}>{title}</Text>

        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {right}
    </View>
  );
};

export const Card = ({children, style}) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

export const ActionButton = ({
  label,
  onPress,
  outline = false,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        outline && styles.outline,
        style,
      ]}>
      <Text
        style={[
          styles.buttonText,
          outline && {color: C.navy},
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const ProgressBar = ({
  progress = 0,
  color = C.green,
}) => {
  const value = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${value}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

export const Empty = ({message}) => {
  return <Text style={styles.empty}>{message}</Text>;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
  },
  subtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  button: {
    backgroundColor: C.navy,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.navy,
  },
  track: {
    height: 12,
    backgroundColor: '#E3E7F0',
    borderRadius: 20,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 20,
  },
  empty: {
    color: C.muted,
    textAlign: 'center',
    marginTop: 28,
  },
});
