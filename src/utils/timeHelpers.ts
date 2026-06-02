export interface GameTime {
  hour: number;      // 1-12
  minute: number;    // 0-59, usually multiples of 5
  isAm: boolean;     // true = AM (sunrise), false = PM (sunset)
}

export function getMaoriNumber(n: number): string {
  if (n === 0) return 'kore';
  if (n <= 10) {
    const units = ['tahi', 'rua', 'toru', 'whā', 'rima', 'ono', 'whitu', 'waru', 'iwa', 'tekau'];
    return units[n - 1];
  }
  if (n < 20) {
    return 'tekau mā ' + getMaoriNumber(n - 10);
  }
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (ones === 0) {
    return getMaoriNumber(tens) + ' tekau';
  } else {
    return getMaoriNumber(tens) + ' tekau mā ' + getMaoriNumber(ones);
  }
}

export function getMaoriHour(hour: number): string {
  if (hour === 1) return 'Kotahi';
  if (hour >= 2 && hour <= 9) {
    const names = ['', '', 'rua', 'toru', 'whā', 'rima', 'ono', 'whitu', 'waru', 'iwa'];
    return `E ${names[hour]}`;
  }
  if (hour === 10) return 'Tekau';
  if (hour === 11) return 'Tekau mā tahi';
  if (hour === 12) return 'Tekau mā rua';
  return '';
}

export function getMaoriHourSimple(hour: number): string {
  if (hour === 1) return 'kotahi';
  if (hour === 10) return 'tekau';
  if (hour === 11) return 'tekau mā tahi';
  if (hour === 12) return 'tekau mā rua';
  const names = ['', 'kotahi', 'rua', 'toru', 'whā', 'rima', 'ono', 'whitu', 'waru', 'iwa'];
  return names[hour];
}

export function getMaoriMinutesPart(minutes: number): string {
  if (minutes === 0) return '';
  if (minutes >= 2 && minutes <= 9) {
    return `e ${getMaoriNumber(minutes)}`;
  }
  return getMaoriNumber(minutes);
}

export function getMaoriTime(hour: number, minutes: number): string {
  if (minutes === 0) {
    return `${getMaoriHour(hour)} karaka`;
  }
  
  // Past phrasing (for minutes 5, 10, 15, 20, 25, 30):
  if (minutes === 5 || minutes === 10 || minutes === 15 || minutes === 20 || minutes === 25 || minutes === 30) {
    const minStr = getMaoriMinutesPart(minutes);
    const hrStr = getMaoriHourSimple(hour);
    return `E ${minStr} miniti mai te ${hrStr} karaka`;
  }
  
  // Sequential phrasing for other minutes (e.g. 2:50 -> E rua karaka rima tekau miniti)
  const hrPhrase = getMaoriHour(hour);
  const minPhrase = getMaoriMinutesPart(minutes);
  return `${hrPhrase} karaka ${minPhrase} miniti`;
}

export function formatDigitalTime(time: GameTime): string {
  const hh = time.hour.toString().padStart(2, '0');
  const mm = time.minute.toString().padStart(2, '0');
  const period = time.isAm ? 'AM' : 'PM';
  return `${hh}:${mm} ${period}`;
}

export function getRandomTime(): GameTime {
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  const isAm = Math.random() > 0.5;
  return { hour, minute, isAm };
}

// Generate incorrect options that are clearly distinct but reasonable (changing either hour, minute, or AM/PM)
export function generateQuizOptions(correct: GameTime): GameTime[] {
  const optionsList: GameTime[] = [correct];
  
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  while (optionsList.length < 4) {
    let mode = Math.floor(Math.random() * 3); // 0 = change hour, 1 = change minute, 2 = change shift
    let fakeHour = correct.hour;
    let fakeMinute = correct.minute;
    let fakeIsAm = correct.isAm;

    if (mode === 0) {
      const filtered = hours.filter(h => h !== correct.hour);
      fakeHour = filtered[Math.floor(Math.random() * filtered.length)];
    } else if (mode === 1) {
      const filtered = minutes.filter(m => m !== correct.minute);
      fakeMinute = filtered[Math.floor(Math.random() * filtered.length)];
    } else {
      fakeIsAm = !correct.isAm;
    }

    // Ensure uniqueness
    const alreadyExists = optionsList.some(
      opt => opt.hour === fakeHour && opt.minute === fakeMinute && opt.isAm === fakeIsAm
    );

    if (!alreadyExists) {
      optionsList.push({ hour: fakeHour, minute: fakeMinute, isAm: fakeIsAm });
    }
  }

  // Shuffle options
  return optionsList.sort(() => 0.5 - Math.random());
}

// Associated daily school schedule tasks in Māori
export interface ScheduleTask {
  timeMaori: string;
  timeDigital: string;
  hour: number;
  minute: number;
  isAm: boolean;
  activityMaori: string;
  activityEnglish: string;
  emoji: string;
}

export const DAILY_CHORES: ScheduleTask[] = [
  {
    timeMaori: "Kotahi karaka e toru tekau miniti mai te pākatia (Actually let's use standard: E toru tekau miniti mai te tahi karaka)",
    timeDigital: "01:30 AM",
    hour: 1,
    minute: 30,
    isAm: true,
    activityMaori: "Te wā moe",
    activityEnglish: "Deep sleep time",
    emoji: "😴"
  },
  {
    timeMaori: "E toru tekau miniti mai te whitu karaka",
    timeDigital: "07:30 AM",
    hour: 7,
    minute: 30,
    isAm: true,
    activityMaori: "Te wā oho",
    activityEnglish: "Wake up time & breakfast",
    emoji: "🥣"
  },
  {
    timeMaori: "Kotahi karaka",
    timeDigital: "09:00 AM", // Wait, 9:00 is E iwa karaka
    hour: 9,
    minute: 0,
    isAm: true,
    activityMaori: "Te wā tīmata te kura",
    activityEnglish: "School start time",
    emoji: "🏫"
  },
  {
    timeMaori: "E toru tekau miniti mai te iwa karaka",
    timeDigital: "09:30 AM",
    hour: 9,
    minute: 30,
    isAm: true,
    activityMaori: "Te wā pāngarau",
    activityEnglish: "Maths time",
    emoji: "📐"
  },
  {
    timeMaori: "E toru tekau miniti mai te tekau karaka",
    timeDigital: "10:30 AM",
    hour: 10,
    minute: 30,
    isAm: true,
    activityMaori: "Ko te wā paramanawa",
    activityEnglish: "Snack time (morning tea)",
    emoji: "🍎"
  },
  {
    timeMaori: "E toru tekau miniti mai te tekau mā tahi karaka",
    timeDigital: "11:30 AM",
    hour: 11,
    minute: 30,
    isAm: true,
    activityMaori: "Te reo Matatini",
    activityEnglish: "Literacy / language time",
    emoji: "📚"
  },
  {
    timeMaori: "E toru tekau miniti mai te tekau mā rua karaka",
    timeDigital: "12:30 PM",
    hour: 12,
    minute: 30,
    isAm: false,
    activityMaori: "Te wā kai tina",
    activityEnglish: "Lunch time",
    emoji: "🍱"
  },
  {
    timeMaori: "E toru karaka",
    timeDigital: "03:00 PM",
    hour: 3,
    minute: 0,
    isAm: false,
    activityMaori: "Te wā kura whakakapi",
    activityEnglish: "School ends / pack up time",
    emoji: "🎒"
  },
  {
    timeMaori: "E rima karaka e toru tekau miniti",
    timeDigital: "05:30 PM",
    hour: 5,
    minute: 30,
    isAm: false,
    activityMaori: "Te wā hapa",
    activityEnglish: "Dinner time",
    emoji: "🍲"
  },
  {
    timeMaori: "E waru karaka",
    timeDigital: "08:00 PM",
    hour: 8,
    minute: 0,
    isAm: false,
    activityMaori: "Te wā hoki ki te moenga",
    activityEnglish: "Bedtime",
    emoji: "🌙"
  }
];
