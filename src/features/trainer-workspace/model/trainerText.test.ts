import { translateTrainerText } from './trainerText';

describe('translateTrainerText', () => {
  it('returns Vietnamese for known text and falls back to the original', () => {
    expect(translateTrainerText('vi', 'Create appointment')).toBe('Tạo lịch hẹn');
    expect(translateTrainerText('vi', 'Unknown copy')).toBe('Unknown copy');
  });
  it('leaves English untouched', () => {
    expect(translateTrainerText('en', 'Create appointment')).toBe('Create appointment');
    expect(translateTrainerText(undefined, 'Create appointment')).toBe('Create appointment');
  });
});
