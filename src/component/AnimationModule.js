
import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

const AnimatedModule = ({children, index = 0, style}) => {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 65,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, scale]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{scale}],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedModule;
