export const mathematicsQuestions = [
  {
    "id": "mth_01",
    "year": 2023,
    "topic": "Indices & Logarithms",
    "question": "Evaluate: log₁₀(25) + log₁₀(4) − log₁₀(10)",
    "options": [
      "0",
      "1",
      "2",
      "3"
    ],
    "answer": 1,
    "explanation": "log₁₀(25 × 4 / 10) = log₁₀(100 / 10) = log₁₀(10) = 1.",
    "difficulty": "easy"
  },
  {
    "id": "mth_02",
    "year": 2023,
    "topic": "Calculus - Differentiation",
    "question": "If y = 3x⁴ − 5x² + 7x − 9, find dy/dx at x = 2.",
    "options": [
      "43",
      "67",
      "76",
      "83"
    ],
    "answer": 3,
    "explanation": "dy/dx = 12x³ − 10x + 7. At x = 2: 12(8) − 10(2) + 7 = 96 − 20 + 7 = 83.",
    "difficulty": "medium"
  },
  {
    "id": "mth_03",
    "year": 2023,
    "topic": "Quadratic Equations",
    "question": "If α and β are the roots of the equation 2x² − 7x + 5 = 0, find the value of (α + β)² − 2αβ.",
    "options": [
      "29/4",
      "49/4",
      "19/4",
      "39/4"
    ],
    "answer": 0,
    "explanation": "α + β = −(−7)/2 = 7/2. αβ = 5/2. (α + β)² − 2αβ = (7/2)² − 2(5/2) = 49/4 − 5 = 49/4 − 20/4 = 29/4.",
    "difficulty": "medium"
  },
  {
    "id": "mth_04",
    "year": 2022,
    "topic": "Trigonometry",
    "question": "If sin θ = 3/5, where 0° < θ < 90°, evaluate (cos θ + tan θ).",
    "options": [
      "31/20",
      "23/20",
      "7/5",
      "4/3"
    ],
    "answer": 0,
    "explanation": "Using a right triangle, opp = 3, hyp = 5, adj = √(25 − 9) = 4. cos θ = 4/5, tan θ = 3/4. Sum = 4/5 + 3/4 = 16/20 + 15/20 = 31/20.",
    "difficulty": "medium"
  },
  {
    "id": "mth_05",
    "year": 2022,
    "topic": "Matrices & Determinants",
    "question": "Find the determinant of the matrix: | 4  −2 | / | 3   5 |",
    "options": [
      "14",
      "26",
      "20",
      "−26"
    ],
    "answer": 1,
    "explanation": "Determinant = (4 × 5) − (−2 × 3) = 20 − (−6) = 20 + 6 = 26.",
    "difficulty": "easy"
  },
  {
    "id": "mth_06",
    "year": 2021,
    "topic": "Sequences & Series (AP & GP)",
    "question": "The 3rd term of an Arithmetic Progression (A.P.) is 10 and the 8th term is 25. Find the first term (a) and common difference (d).",
    "options": [
      "a = 4, d = 3",
      "a = 3, d = 4",
      "a = 2, d = 5",
      "a = 5, d = 3"
    ],
    "answer": 0,
    "explanation": "T3 = a + 2d = 10; T8 = a + 7d = 25. Subtracting equations: 5d = 15 → d = 3. Then a + 2(3) = 10 → a = 4.",
    "difficulty": "easy"
  },
  {
    "id": "mth_07",
    "year": 2021,
    "topic": "Probability",
    "question": "Two fair dice are rolled together once. What is the probability of obtaining a total score of 8?",
    "options": [
      "1/6",
      "5/36",
      "7/36",
      "1/9"
    ],
    "answer": 1,
    "explanation": "Pairs summing to 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Total possible outcomes = 36. Probability = 5/36.",
    "difficulty": "easy"
  },
  {
    "id": "mth_08",
    "year": 2020,
    "topic": "Calculus - Integration",
    "question": "Evaluate: ∫ (6x² − 4x + 1) dx from x = 0 to x = 2.",
    "options": [
      "8",
      "10",
      "12",
      "14"
    ],
    "answer": 1,
    "explanation": "Integral = [2x³ − 2x² + x] from 0 to 2 = 2(8) − 2(4) + 2 = 16 − 8 + 2 = 10.",
    "difficulty": "medium"
  },
  {
    "id": "mth_09",
    "year": 2020,
    "topic": "Set Theory",
    "question": "In a class of 50 students, 30 study Biology, 25 study Chemistry, and 10 study neither. How many students study BOTH Biology and Chemistry?",
    "options": [
      "10",
      "15",
      "20",
      "25"
    ],
    "answer": 1,
    "explanation": "Total studying at least one = 50 − 10 = 40. n(B ∪ C) = n(B) + n(C) − n(B ∩ C) → 40 = 30 + 25 − x → x = 55 − 40 = 15.",
    "difficulty": "easy"
  },
  {
    "id": "mth_10",
    "year": 2019,
    "topic": "Coordinate Geometry",
    "question": "Find the gradient of the line perpendicular to the line 3x − 2y + 6 = 0.",
    "options": [
      "3/2",
      "−3/2",
      "−2/3",
      "2/3"
    ],
    "answer": 2,
    "explanation": "Rewrite 3x − 2y + 6 = 0 as 2y = 3x + 6 → y = (3/2)x + 3. Gradient m₁ = 3/2. For perpendicular lines, m₂ = −1 / m₁ = −2/3.",
    "difficulty": "medium"
  },
  {
    "id": "mat_11",
    "year": 2021,
    "topic": "geometry",
    "question": "find the value of p if the line which passes through (-1, -p) and (-2,2) is parallel to the line 2y+8x-17=0?",
    "options": [
      "-2/7",
      "7/6",
      "-6/7",
      "2"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "mat_12",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "In the figure below, find the <RTP.",
    "options": [
      "65°",
      "55°",
      "45°",
      "35°"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "mat_13",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "If log₂₇(3^(2x)) = -1, find the value of x.",
    "options": [
      "4/3",
      "-2/3",
      "3/2",
      "-3/4"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "mat_14",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "If kt² - vt - 6 = 0, make t the subject of the formula.",
    "options": [
      "(v±√(v²+24k))/2k",
      "(v±√(v²-24k))/2k",
      "(v±√(v²+12k))/2k",
      "(v±√(v²-12k))/2k"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "mat_15",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Solve x² - 2x - 8 > 0.",
    "options": [
      "x 4",
      "x 2",
      "-2 < x < 4",
      "-4 < x < 2"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "mat_16",
    "year": 2005,
    "topic": "number-theory",
    "question": "Find the value of m if 13_(m) + 24_(m) = 41_(m)",
    "options": [
      "8",
      "6",
      "5",
      "2"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "mat_17",
    "year": 2003,
    "topic": "algebra",
    "question": "Evaluate log_(√2)4 + log1/2 16 − log₄32",
    "options": [
      "-5.5",
      "-2.5",
      "2.5",
      "5.5"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "hard"
  },
  {
    "id": "mat_18",
    "year": 2022,
    "topic": "algebra",
    "question": "Simplify 1/(3−√2)\n in the form of p + q√2",
    "options": [
      "7/(3 - 1/7√2)",
      "7/(3 + 1/7√2)",
      "3/(7 - 1/7√2)",
      "3/(7 + √2/7)"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "mat_19",
    "year": 2017,
    "topic": "algebra",
    "question": "Given T = { even numbers from 1 to 12 }\nN = {common factors of 6, 8 and 12}\nFind T ∩ N",
    "options": [
      "{2, 3}",
      "{2, 3, 4}",
      "{3, 4, 6}",
      "{2}"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "mat_20",
    "year": 2006,
    "topic": "statistics",
    "question": "The table above shows the scores of a group of students in a physics test. If the mode is m and the number of students who scored 4 or more is n, what is (n, m)?",
    "options": [
      "(33, 4)",
      "(22, 4)",
      "(33, 12)",
      "(12, 4)"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_21",
    "year": 2021,
    "topic": "algebra",
    "question": "Solve the following equation: 2(2r−1) - 5/3 = 1(r+2)",
    "options": [
      "( -1, 5/2 )",
      "( 1, - 5/2 )",
      "( 5/2, 1 )",
      "(2,1)"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "hard"
  },
  {
    "id": "mat_22",
    "year": 2007,
    "topic": "statistics",
    "question": "If 5, 8, 6 and 2 occur with frequencies 3, 2, 4 and 1 respectively. Find the product of the modal and the median number",
    "options": [
      "36",
      "48",
      "30",
      "40"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_23",
    "year": 2004,
    "topic": "geometry",
    "question": "An arc of a circle of length 22 cm subtends an angle of 3x° at the center of the circle. Find the value of x if the diameter of the circle is 14 cm",
    "options": [
      "60°",
      "120°",
      "180°",
      "30°"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_24",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Given that 1.5^x = 243/32, find the value of x.",
    "options": [
      "8",
      "7",
      "9",
      "5"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "mat_25",
    "year": 2021,
    "topic": "algebra",
    "passage": {
      "title": "Reading Comprehension Passage",
      "text": "0.00275\n ×\n 0.00640\n\n 0.025\n ×\n 0.08"
    },
    "question": "Simplify and express in standard form (0.00275 × 0.00640)/(0.025 × 0.08)",
    "options": [
      "8.8 x 10⁻¹",
      "8.8 x 10⁻²",
      "8.8 x 10⁻²",
      "8.8 x 10³"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "mat_26",
    "year": 2022,
    "topic": "geometry",
    "question": "A rectangular pyramid has an area 24cm²\n and height 7.5cm. Find its volume?",
    "options": [
      "65.0cm³",
      "70.5cm³",
      "56.5cm³",
      "60.0cm³"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "mat_27",
    "year": 2022,
    "topic": "algebra",
    "question": "Given that r = √(3v/πh), make v the subject of the formula",
    "options": [
      "v = 3 πr²\n h",
      "v = πrh/3",
      "v =  πr²h/3",
      "v = 3πrh"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "mat_28",
    "year": 2021,
    "topic": "calculus",
    "question": "determine the maximum value of y=3x² + 5x - 3",
    "options": [
      "6",
      "0",
      "2",
      "No correct option"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "mat_29",
    "year": 2001,
    "topic": "number-theory",
    "question": "Evaluate 21.05347 - 1.6324 x 0.43 to 3 decimal places",
    "options": [
      "20.98",
      "20.351",
      "20.981",
      "20.352"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "mat_30",
    "year": 2022,
    "topic": "calculus",
    "question": "Integrate (2x+1)³",
    "options": [
      "2x+1³/8\n + C",
      "2x+1⁴/8\n + C",
      "2x+1⁴/4\n + C",
      "2x+1²/6\n + C"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "hard"
  },
  {
    "id": "mat_31",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "The sum of the interior angles of a polygon is 20 right angles. How many sides does the polygon have?",
    "options": [
      "10",
      "12",
      "15",
      "18"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "mat_32",
    "year": 2021,
    "topic": "algebra-further",
    "question": "In how many ways can 2 students be selected from a group of 5 students in a debating competition?",
    "options": [
      "25 ways",
      "10 ways",
      "15 ways",
      "20 ways"
    ],
    "answer": 1,
    "explanation": "SOLUTION: \n I\n n\n\n 5\n\n C\n \n 2\n\n w\n a\n y\n s\n \n =\n\n 5\n !\n\n (\n 5\n −\n 2\n )\n !\n 2\n !\n\n =\n\n 5\n !\n\n 3\n !\n 2\n !\n\n =\n\n 5\n ×\n 4\n ×\n 3\n !\n\n 3\n !\n ×\n 2\n ×\n 1\n\n =\n 10\n \n w\n a\n y\n s",
    "difficulty": "medium"
  },
  {
    "id": "mat_33",
    "year": 2009,
    "topic": "algebra",
    "question": "If 55ₓ + 52ₓ = 77₁₀ find X",
    "options": [
      "5",
      "6",
      "7",
      "10"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "mat_34",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "In the figure below, PQRS is a trapezium of area 14cm² in which PQ//RS. If PQ = 4cm and SR = 3cm, find the area of triangle SQR in cm².",
    "options": [
      "9cm²",
      "8cm²",
      "6cm²",
      "4cm²"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "mat_35",
    "year": 2022,
    "topic": "statistics",
    "question": "Mr Adu spends his annual salary on food(f), rent(r), car maintenance, gift+B10s(g), savings(s) and some B28miscellaneous (m) as indicate in the table below: If the above information is represented on a pie chart. What angle represents his spending on food?",
    "options": [
      "108.5",
      "100.8",
      "98.8",
      "120.5"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "mat_36",
    "year": 2022,
    "topic": "statistics",
    "question": "If the mean of 2, 5, (x+1), (x+2), 7 and 9 is 6. Find the median",
    "options": [
      "5.5",
      "5",
      "6.5",
      "6"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "mat_37",
    "year": 2021,
    "topic": "number-theory",
    "question": "Three children shared a basket of mangoes in such a way that the first child took 1/4 of the mangoes and the second 3/4 of the remainder. What fraction of the mangoes did the third child take?",
    "options": [
      "3/16",
      "7/16",
      "9/16",
      "13/16"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_38",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Evaluate (0.12)³ × 0.315/2(0.006) correct to 3 decimal places.",
    "options": [
      "0.024",
      "0.346",
      "0.045",
      "0.365"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "mat_39",
    "year": 2018,
    "topic": "algebra",
    "question": "In a class of 40 students, 32 offer Mathematics, 24 offer Physics and 4 offer neither Mathematics nor Physics. How many offer both Mathematics and Physics?",
    "options": [
      "4",
      "8",
      "16",
      "20"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "mat_40",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Find the volume of the figure above.",
    "options": [
      "608πcm³",
      "846πcm³",
      "578πcm³",
      "906πcm³"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "mat_41",
    "year": 2022,
    "topic": "algebra",
    "question": "The 10th term of an AP is 32. If the first term is 3/2, what is the 4th term?",
    "options": [
      "35/3",
      "64",
      "16",
      "35/2"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_42",
    "year": 2008,
    "topic": "number-theory",
    "question": "Add 1101₂ ,10111₂ and 111₂",
    "options": [
      "111011₂",
      "110110₂",
      "101011₂",
      "101010₂"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "mat_43",
    "year": 2022,
    "topic": "trigonometry",
    "question": "If sin θ = - 3/5\n and θ lies in the third quadrant, find cos θ",
    "options": [
      "4/5",
      "-1 1/4",
      "5/4",
      "- 4/5"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "mat_44",
    "year": 2022,
    "topic": "geometry",
    "question": "Find the length of a chord 3cm from the centre of a circle of radius 5cm",
    "options": [
      "8cm",
      "5.6cm",
      "7cm",
      "6.5cm"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_45",
    "year": 2022,
    "topic": "algebra",
    "question": "Solve for k in the equation 1/8^(k+2)\n = 1",
    "options": [
      "2",
      "-4",
      "-2",
      "4"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "mat_46",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "In the diagram, ABCD is a square of side 3½cm and ADE is a quadrant of a circle. Find the area of the figure to the nearest whole number.",
    "options": [
      "33cm²",
      "28cm²",
      "22cm²",
      "21cm²"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "mat_47",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "A solid cylinder of radius 3cm has a total surface area of 72πcm². Find its height.",
    "options": [
      "7cm",
      "9cm",
      "10cm",
      "12cm"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "mat_48",
    "year": 2021,
    "topic": "statistics",
    "question": "Find the mean deviation of 1, 2, 3 and 4",
    "options": [
      "1.0",
      "1.5",
      "2.0",
      "2.5"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "mat_49",
    "year": 2021,
    "topic": "number-theory",
    "question": "Correct 241.34(3 x 10⁻³\n)2²\n to 4 significant figures",
    "options": [
      "0.0014",
      "0.001448",
      "0.0022",
      "0.002172"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "mat_50",
    "year": 2022,
    "topic": "algebra-further",
    "question": "In how many ways can the letter of ZOOLOGY be arranged?",
    "options": [
      "720",
      "360",
      "840",
      "120"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  }
];
