export const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  hours: {
    required: 'Hours are required.',
    min: 'Must be at least 0.'
  },
  minutes: {
    required: 'Minutes are required.',
    min: 'Must be at least 0.',
    max: 'Must be less than 60.'
  },
  seconds: {
    required: 'Seconds are required.',
    min: 'Must be at least 0.',
    max: 'Must be less than 60.'
  }
};
