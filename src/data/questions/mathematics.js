export const mathematicsQuestions = [
  {
    id: "mth_01",
    year: 2023,
    topic: "Indices & Logarithms",
    question: "Evaluate: log₁₀(25) + log₁₀(4) − log₁₀(10)",
    options: [
      "0",
      "1",
      "2",
      "3"
    ],
    answer: 1,
    explanation: "log₁₀(25 × 4 / 10) = log₁₀(100 / 10) = log₁₀(10) = 1.",
    difficulty: "easy"
  },
  {
    id: "mth_02",
    year: 2023,
    topic: "Calculus - Differentiation",
    question: "If y = 3x⁴ − 5x² + 7x − 9, find dy/dx at x = 2.",
    options: [
      "43",
      "67",
      "76",
      "83"
    ],
    answer: 3,
    explanation: "dy/dx = 12x³ − 10x + 7. At x = 2: 12(8) − 10(2) + 7 = 96 − 20 + 7 = 83.",
    difficulty: "medium"
  },
  {
    id: "mth_03",
    year: 2023,
    topic: "Quadratic Equations",
    question: "If α and β are the roots of the equation 2x² − 7x + 5 = 0, find the value of (α + β)² − 2αβ.",
    options: [
      "29/4",
      "49/4",
      "19/4",
      "39/4"
    ],
    answer: 0,
    explanation: "α + β = −(−7)/2 = 7/2. αβ = 5/2. (α + β)² − 2αβ = (7/2)² − 2(5/2) = 49/4 − 5 = 49/4 − 20/4 = 29/4.",
    difficulty: "medium"
  },
  {
    id: "mth_04",
    year: 2022,
    topic: "Trigonometry",
    question: "If sin θ = 3/5, where 0° < θ < 90°, evaluate (cos θ + tan θ).",
    options: [
      "31/20",
      "23/20",
      "7/5",
      "4/3"
    ],
    answer: 0,
    explanation: "Using a right triangle, opp = 3, hyp = 5, adj = √(25 − 9) = 4. cos θ = 4/5, tan θ = 3/4. Sum = 4/5 + 3/4 = 16/20 + 15/20 = 31/20.",
    difficulty: "medium"
  },
  {
    id: "mth_05",
    year: 2022,
    topic: "Matrices & Determinants",
    question: "Find the determinant of the matrix: | 4  −2 | / | 3   5 |",
    options: [
      "14",
      "26",
      "20",
      "−26"
    ],
    answer: 1,
    explanation: "Determinant = (4 × 5) − (−2 × 3) = 20 − (−6) = 20 + 6 = 26.",
    difficulty: "easy"
  },
  {
    id: "mth_06",
    year: 2021,
    topic: "Sequences & Series (AP & GP)",
    question: "The 3rd term of an Arithmetic Progression (A.P.) is 10 and the 8th term is 25. Find the first term (a) and common difference (d).",
    options: [
      "a = 4, d = 3",
      "a = 3, d = 4",
      "a = 2, d = 5",
      "a = 5, d = 3"
    ],
    answer: 0,
    explanation: "T3 = a + 2d = 10; T8 = a + 7d = 25. Subtracting equations: 5d = 15 → d = 3. Then a + 2(3) = 10 → a = 4.",
    difficulty: "easy"
  },
  {
    id: "mth_07",
    year: 2021,
    topic: "Probability",
    question: "Two fair dice are rolled together once. What is the probability of obtaining a total score of 8?",
    options: [
      "1/6",
      "5/36",
      "7/36",
      "1/9"
    ],
    answer: 1,
    explanation: "Pairs summing to 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Total possible outcomes = 36. Probability = 5/36.",
    difficulty: "easy"
  },
  {
    id: "mth_08",
    year: 2020,
    topic: "Calculus - Integration",
    question: "Evaluate: ∫ (6x² − 4x + 1) dx from x = 0 to x = 2.",
    options: [
      "8",
      "10",
      "12",
      "14"
    ],
    answer: 1,
    explanation: "Integral = [2x³ − 2x² + x] from 0 to 2 = 2(8) − 2(4) + 2 = 16 − 8 + 2 = 10.",
    difficulty: "medium"
  },
  {
    id: "mth_09",
    year: 2020,
    topic: "Set Theory",
    question: "In a class of 50 students, 30 study Biology, 25 study Chemistry, and 10 study neither. How many students study BOTH Biology and Chemistry?",
    options: [
      "10",
      "15",
      "20",
      "25"
    ],
    answer: 1,
    explanation: "Total studying at least one = 50 − 10 = 40. n(B ∪ C) = n(B) + n(C) − n(B ∩ C) → 40 = 30 + 25 − x → x = 55 − 40 = 15.",
    difficulty: "easy"
  },
  {
    id: "mth_10",
    year: 2019,
    topic: "Coordinate Geometry",
    question: "Find the gradient of the line perpendicular to the line 3x − 2y + 6 = 0.",
    options: [
      "3/2",
      "−3/2",
      "−2/3",
      "2/3"
    ],
    answer: 2,
    explanation: "Rewrite 3x − 2y + 6 = 0 as 2y = 3x + 6 → y = (3/2)x + 3. Gradient m₁ = 3/2. For perpendicular lines, m₂ = −1 / m₁ = −2/3.",
    difficulty: "medium"
  }
];
