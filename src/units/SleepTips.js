
export const getSleepTip = (sleepHours, records = []) => {
    const hours = Number(sleepHours);
  
    if (!Number.isFinite(hours) || hours <= 0) {
      return {
        title: '💡 Sleep Tip',
        message:
          'Track your daily sleep to get personalized sleep tips.',
      };
    }
  
    if (hours < 5) {
      return {
        title: '😴 Very Low Sleep',
        message:
          'You slept less than 5 hours. Try going to bed earlier and follow a regular sleep schedule.',
      };
    }
  
    if (hours < 7) {
      return {
        title: '🌙 Improve Your Sleep',
        message:
          'You are getting less than 7 hours of sleep. Try reducing screen time before bedtime.',
      };
    }
  
    if (hours <= 9) {
      return {
        title: '✅ Healthy Sleep',
        message:
          'Great! Your sleep duration is within the typical 7–9 hour range recommended for adults.',
      };
    }
  
    return {
      title: '💤 Long Sleep',
      message:
        'You slept more than 9 hours. Maintain a consistent sleep routine. If you often feel tired despite long sleep, consider speaking with a healthcare professional.',
    };
  };
  