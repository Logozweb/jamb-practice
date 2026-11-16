export const AVAILABLE_SUBJECTS = [
  { id: 'english', name: 'Use of English', code: 'ENG', icon: '📝', defaultCount: 60, compulsory: true },
  { id: 'mathematics', name: 'Mathematics', code: 'MTH', icon: '📐', defaultCount: 40, compulsory: false },
  { id: 'physics', name: 'Physics', code: 'PHY', icon: '⚡', defaultCount: 40, compulsory: false },
  { id: 'chemistry', name: 'Chemistry', code: 'CHM', icon: '🧪', defaultCount: 40, compulsory: false },
  { id: 'biology', name: 'Biology', code: 'BIO', icon: '🌿', defaultCount: 40, compulsory: false },
  { id: 'economics', name: 'Economics', code: 'ECN', icon: '📊', defaultCount: 40, compulsory: false },
  { id: 'government', name: 'Government', code: 'GOV', icon: '🏛️', defaultCount: 40, compulsory: false },
  { id: 'literature', name: 'Literature in English', code: 'LIT', icon: '📚', defaultCount: 40, compulsory: false },
  { id: 'commerce', name: 'Commerce', code: 'COM', icon: '💼', defaultCount: 40, compulsory: false },
];

export const FACULTY_COMBINATIONS = [
  {
    name: 'Medicine & Health Sciences',
    faculty: 'Medical',
    subjects: ['english', 'biology', 'chemistry', 'physics']
  },
  {
    name: 'Engineering & Technology',
    faculty: 'Engineering',
    subjects: ['english', 'mathematics', 'physics', 'chemistry']
  },
  {
    name: 'Computer Science & ICT',
    faculty: 'Computing',
    subjects: ['english', 'mathematics', 'physics', 'chemistry']
  },
  {
    name: 'Law & Legal Studies',
    faculty: 'Law',
    subjects: ['english', 'literature', 'government', 'economics']
  },
  {
    name: 'Accounting / Business Admin',
    faculty: 'Management Sciences',
    subjects: ['english', 'mathematics', 'economics', 'commerce']
  },
  {
    name: 'Political Science & Mass Comm',
    faculty: 'Social Sciences',
    subjects: ['english', 'government', 'literature', 'economics']
  },
  {
    name: 'Agricultural Sciences',
    faculty: 'Agriculture',
    subjects: ['english', 'biology', 'chemistry', 'physics']
  }
];
