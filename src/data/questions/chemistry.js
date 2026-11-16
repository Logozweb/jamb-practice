export const chemistryQuestions = [
  {
    id: "chm_01",
    year: 2023,
    topic: "Stoichiometry & Gas Laws",
    question: "Calculate the volume of oxygen gas required at s.t.p. to completely burn 2.8 g of ethene (C₂H₄). [H = 1, C = 12, Molar volume of gas at s.t.p. = 22.4 dm³]",
    options: [
      "2.24 dm³",
      "4.48 dm³",
      "6.72 dm³",
      "8.96 dm³"
    ],
    answer: 2,
    explanation: "Equation: C₂H₄ + 3O₂ → 2CO₂ + 2H₂O. Molar mass of C₂H₄ = 28 g/mol. Moles of C₂H₄ = 2.8 / 28 = 0.10 mol. From stoichiometry, moles of O₂ required = 3 × 0.10 = 0.30 mol. Volume at s.t.p. = 0.30 × 22.4 dm³ = 6.72 dm³.",
    difficulty: "hard"
  },
  {
    id: "chm_02",
    year: 2023,
    topic: "Acids, Bases & Salts",
    question: "What is the pH of a 0.005 mol/dm³ solution of tetraoxosulphate(VI) acid (H₂SO₄), assuming complete dissociation?",
    options: [
      "1.0",
      "2.0",
      "2.3",
      "3.0"
    ],
    answer: 1,
    explanation: "H₂SO₄ is diprotic: H₂SO₄ → 2H⁺ + SO₄²⁻. [H⁺] = 2 × 0.005 = 0.01 mol/dm³ = 10⁻² mol/dm³. pH = −log₁₀[H⁺] = −log₁₀(10⁻²) = 2.0.",
    difficulty: "medium"
  },
  {
    id: "chm_03",
    year: 2023,
    topic: "Organic Chemistry - Functional Groups",
    question: "Which of the following functional groups characterizes alkanols?",
    options: [
      "−COOH",
      "−CHO",
      "−OH",
      "−COOR"
    ],
    answer: 2,
    explanation: "Alkanols contain the hydroxyl group (−OH) attached to an sp³ hybridized carbon atom.",
    difficulty: "easy"
  },
  {
    id: "chm_04",
    year: 2022,
    topic: "Electrochemistry & Electrolysis",
    question: "During the electrolysis of acidified copper(II) sulphate solution using platinum electrodes, the product liberated at the anode is:",
    options: [
      "Copper metal",
      "Hydrogen gas",
      "Oxygen gas",
      "Sulphur dioxide"
    ],
    answer: 2,
    explanation: "At the anode, OH⁻ ions are preferentially discharged over SO₄²⁻ ions according to the electrochemical series: 4OH⁻ → 2H₂O + O₂ + 4e⁻, liberating oxygen gas.",
    difficulty: "medium"
  },
  {
    id: "chm_05",
    year: 2022,
    topic: "Chemical Equilibrium",
    question: "Consider the exothermic reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = −92 kJ/mol. An increase in temperature will:",
    options: [
      "Shift the equilibrium to the right, yielding more ammonia",
      "Shift the equilibrium to the left, decreasing ammonia yield",
      "Increase both forward and backward rates equally with no shift",
      "Have zero effect on the equilibrium position"
    ],
    answer: 1,
    explanation: "By Le Chatelier's principle, increasing temperature favors the endothermic direction (reverse reaction), shifting equilibrium to the left and decreasing NH₃ yield.",
    difficulty: "medium"
  },
  {
    id: "chm_06",
    year: 2021,
    topic: "Periodic Table & Periodicity",
    question: "Which of the following elements possesses the HIGHEST first ionization energy?",
    options: [
      "Sodium (Na)",
      "Magnesium (Mg)",
      "Chlorine (Cl)",
      "Argon (Ar)"
    ],
    answer: 3,
    explanation: "Argon has a stable octet valence electron configuration (noble gas) and the highest nuclear charge in Period 3, giving it the highest first ionization energy.",
    difficulty: "easy"
  },
  {
    id: "chm_07",
    year: 2021,
    topic: "Redox Reactions",
    question: "What is the oxidation number of chromium in the dichromate ion (Cr₂O₇²⁻)?",
    options: [
      "+3",
      "+4",
      "+6",
      "+7"
    ],
    answer: 2,
    explanation: "Let x be oxidation state of Cr: 2(x) + 7(−2) = −2 → 2x − 14 = −2 → 2x = 12 → x = +6.",
    difficulty: "easy"
  },
  {
    id: "chm_08",
    year: 2020,
    topic: "Separation Techniques",
    question: "Fractional distillation is employed to separate petroleum into fractions because the components differ significantly in their:",
    options: [
      "Densities",
      "Boiling points",
      "Solubilities in water",
      "Magnetic susceptibilities"
    ],
    answer: 1,
    explanation: "Fractional distillation separates volatile miscible liquids based on differences in their boiling points.",
    difficulty: "easy"
  },
  {
    id: "chm_09",
    year: 2020,
    topic: "Nuclear Chemistry",
    question: "When a nucleus emits an alpha particle (⁴₂α), its atomic number and mass number decrease by:",
    options: [
      "Atomic number by 1, mass number by 2",
      "Atomic number by 2, mass number by 4",
      "Atomic number by 4, mass number by 2",
      "Atomic number by 0, mass number by 1"
    ],
    answer: 1,
    explanation: "An alpha particle is a helium nucleus (⁴₂He²⁺). Emission decreases atomic number (Z) by 2 and mass number (A) by 4.",
    difficulty: "easy"
  },
  {
    id: "chm_10",
    year: 2019,
    topic: "Rates of Reaction",
    question: "A catalyst speeds up the rate of a chemical reaction principally by:",
    options: [
      "Increasing the frequency of molecular collisions",
      "Providing an alternative reaction pathway with lower activation energy",
      "Raising the enthalpy change (ΔH) of the system",
      "Increasing the temperature of the reacting particles"
    ],
    answer: 1,
    explanation: "Catalysts provide an alternative mechanism that possesses a lower activation energy barrier without affecting equilibrium or enthalpy change.",
    difficulty: "easy"
  }
];
