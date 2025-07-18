import { DatePickerInput } from '@mantine/dates';

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DateRangeFilter({ value, onChange, minDate, maxDate }: DateRangeFilterProps) {
  return (
    <DatePickerInput
      type="range"
      value={value}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      clearable
      placeholder="Filter by date range"
      style={{ width: '100%' }}
    />
  );
}
