'use client';

import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function MUIDateTimeClient() {
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  return (
    <div className="  rounded-xl shadow-md">
      

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Select date and time"
          value={selectedDateTime}
          onChange={setSelectedDateTime}
          format="DD-MMM-YYYY HH:mm"
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'large',
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
}
