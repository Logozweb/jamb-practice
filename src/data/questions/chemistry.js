export const chemistryQuestions = [
  {
    "id": "chm_01",
    "year": 2023,
    "topic": "Stoichiometry & Gas Laws",
    "question": "Calculate the volume of oxygen gas required at s.t.p. to completely burn 2.8 g of ethene (C₂H₄). [H = 1, C = 12, Molar volume of gas at s.t.p. = 22.4 dm³]",
    "options": [
      "2.24 dm³",
      "4.48 dm³",
      "6.72 dm³",
      "8.96 dm³"
    ],
    "answer": 2,
    "explanation": "Equation: C₂H₄ + 3O₂ → 2CO₂ + 2H₂O. Molar mass of C₂H₄ = 28 g/mol. Moles of C₂H₄ = 2.8 / 28 = 0.10 mol. From stoichiometry, moles of O₂ required = 3 × 0.10 = 0.30 mol. Volume at s.t.p. = 0.30 × 22.4 dm³ = 6.72 dm³.",
    "difficulty": "hard"
  },
  {
    "id": "chm_02",
    "year": 2023,
    "topic": "Acids, Bases & Salts",
    "question": "What is the pH of a 0.005 mol/dm³ solution of tetraoxosulphate(VI) acid (H₂SO₄), assuming complete dissociation?",
    "options": [
      "1.0",
      "2.0",
      "2.3",
      "3.0"
    ],
    "answer": 1,
    "explanation": "H₂SO₄ is diprotic: H₂SO₄ → 2H⁺ + SO₄²⁻. [H⁺] = 2 × 0.005 = 0.01 mol/dm³ = 10⁻² mol/dm³. pH = −log₁₀[H⁺] = −log₁₀(10⁻²) = 2.0.",
    "difficulty": "medium"
  },
  {
    "id": "chm_03",
    "year": 2023,
    "topic": "Organic Chemistry - Functional Groups",
    "question": "Which of the following functional groups characterizes alkanols?",
    "options": [
      "−COOH",
      "−CHO",
      "−OH",
      "−COOR"
    ],
    "answer": 2,
    "explanation": "Alkanols contain the hydroxyl group (−OH) attached to an sp³ hybridized carbon atom.",
    "difficulty": "easy"
  },
  {
    "id": "chm_04",
    "year": 2022,
    "topic": "Electrochemistry & Electrolysis",
    "question": "During the electrolysis of acidified copper(II) sulphate solution using platinum electrodes, the product liberated at the anode is:",
    "options": [
      "Copper metal",
      "Hydrogen gas",
      "Oxygen gas",
      "Sulphur dioxide"
    ],
    "answer": 2,
    "explanation": "At the anode, OH⁻ ions are preferentially discharged over SO₄²⁻ ions according to the electrochemical series: 4OH⁻ → 2H₂O + O₂ + 4e⁻, liberating oxygen gas.",
    "difficulty": "medium"
  },
  {
    "id": "chm_05",
    "year": 2022,
    "topic": "Chemical Equilibrium",
    "question": "Consider the exothermic reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = −92 kJ/mol. An increase in temperature will:",
    "options": [
      "Shift the equilibrium to the right, yielding more ammonia",
      "Shift the equilibrium to the left, decreasing ammonia yield",
      "Increase both forward and backward rates equally with no shift",
      "Have zero effect on the equilibrium position"
    ],
    "answer": 1,
    "explanation": "By Le Chatelier's principle, increasing temperature favors the endothermic direction (reverse reaction), shifting equilibrium to the left and decreasing NH₃ yield.",
    "difficulty": "medium"
  },
  {
    "id": "chm_06",
    "year": 2021,
    "topic": "Periodic Table & Periodicity",
    "question": "Which of the following elements possesses the HIGHEST first ionization energy?",
    "options": [
      "Sodium (Na)",
      "Magnesium (Mg)",
      "Chlorine (Cl)",
      "Argon (Ar)"
    ],
    "answer": 3,
    "explanation": "Argon has a stable octet valence electron configuration (noble gas) and the highest nuclear charge in Period 3, giving it the highest first ionization energy.",
    "difficulty": "easy"
  },
  {
    "id": "chm_07",
    "year": 2021,
    "topic": "Redox Reactions",
    "question": "What is the oxidation number of chromium in the dichromate ion (Cr₂O₇²⁻)?",
    "options": [
      "+3",
      "+4",
      "+6",
      "+7"
    ],
    "answer": 2,
    "explanation": "Let x be oxidation state of Cr: 2(x) + 7(−2) = −2 → 2x − 14 = −2 → 2x = 12 → x = +6.",
    "difficulty": "easy"
  },
  {
    "id": "chm_08",
    "year": 2020,
    "topic": "Separation Techniques",
    "question": "Fractional distillation is employed to separate petroleum into fractions because the components differ significantly in their:",
    "options": [
      "Densities",
      "Boiling points",
      "Solubilities in water",
      "Magnetic susceptibilities"
    ],
    "answer": 1,
    "explanation": "Fractional distillation separates volatile miscible liquids based on differences in their boiling points.",
    "difficulty": "easy"
  },
  {
    "id": "chm_09",
    "year": 2020,
    "topic": "Nuclear Chemistry",
    "question": "When a nucleus emits an alpha particle (⁴₂α), its atomic number and mass number decrease by:",
    "options": [
      "Atomic number by 1, mass number by 2",
      "Atomic number by 2, mass number by 4",
      "Atomic number by 4, mass number by 2",
      "Atomic number by 0, mass number by 1"
    ],
    "answer": 1,
    "explanation": "An alpha particle is a helium nucleus (⁴₂He²⁺). Emission decreases atomic number (Z) by 2 and mass number (A) by 4.",
    "difficulty": "easy"
  },
  {
    "id": "chm_10",
    "year": 2019,
    "topic": "Rates of Reaction",
    "question": "A catalyst speeds up the rate of a chemical reaction principally by:",
    "options": [
      "Increasing the frequency of molecular collisions",
      "Providing an alternative reaction pathway with lower activation energy",
      "Raising the enthalpy change (ΔH) of the system",
      "Increasing the temperature of the reacting particles"
    ],
    "answer": 1,
    "explanation": "Catalysts provide an alternative mechanism that possesses a lower activation energy barrier without affecting equilibrium or enthalpy change.",
    "difficulty": "easy"
  },
  {
    "id": "che_11",
    "year": 2017,
    "topic": "organic-chemistry",
    "question": "The general formula of alkanones is",
    "options": [
      "RCHO",
      "RCOR'",
      "RCOOH",
      "RCOOR"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_12",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Liquid black soap is made by boiling palm oil with liquid extract of ash. The function of the ash is to provide the?",
    "options": [
      "Acid",
      "Ester of alkanoic acid",
      "Alkali",
      "Alkanol"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_13",
    "year": 2021,
    "topic": "atomic-structure",
    "question": "The atomic weight of nitrogen is?",
    "options": [
      "10",
      "12",
      "14",
      "16"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_14",
    "year": 2021,
    "topic": "inorganic-chemistry",
    "question": "Which of the following are chemical changes? I. cooking of food II. digestion of food III. freezing of water IV. water is heated up",
    "options": [
      "I and II",
      "I, II, and III",
      "III and IV",
      "all of the above"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "che_15",
    "year": 2021,
    "topic": "inorganic-chemistry",
    "question": "A breath test used by traffic police to check drunken driving uses?",
    "options": [
      "Tumeric on filter paper",
      "Silica gel coated with saliva nitrate",
      "Potassium permanganate-sulphuric acid",
      "Potassium dichromate-sulphuric acid"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "che_16",
    "year": 2003,
    "topic": "stoichiometry",
    "question": "What volume of oxygen is produced from the decomposition of 2 moles of KClO3 at s.t.p [Molar volume of a gas at s.t.p = 22.4 dm3]",
    "options": [
      "22.4 dm3",
      "33.6 dm3",
      "44.8 dm3",
      "67.2 dm3"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "che_17",
    "year": 2006,
    "topic": "energetics",
    "question": "H2(g) + Br2(g) → 2BHr(g) The reaction above is carried out at 250C. If Δ H is kJ mol-1 and Δ S is -106J mol-1K-1 the reaction will",
    "options": [
      "Proceed spontaneously at lower temperatures",
      "Not proceed spontaneously at the given temperature",
      "Proceed spontaneously at the given temperature",
      "[proceed in the reverse direction at the given temperature"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "che_18",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "If the quantity of oxygen occupying 2.76L container at a pressure of 0.825 atm and 300K is reduced by one-half, what is the pressure exerted by the remaining gas?",
    "options": [
      "1.650atm",
      "0.825atm",
      "0.413atm",
      "0.275atm"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_19",
    "year": 2001,
    "topic": "states-of-matter",
    "question": "25cm3 of a gas X contains Zmolecules at 150C and 75mmHg. How many molecules will 25cmm3 of another gas Y contain at the same temperature and pressure",
    "options": [
      "2Y",
      "2Z",
      "Z",
      "Y"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "che_20",
    "year": 2020,
    "topic": "atomic-structure",
    "question": "The electronic configuration of an element is 1S² 2S² 2P⁶ 3S² 3P³. How many unpaired electrons are there in the element?",
    "options": [
      "5",
      "4",
      "3",
      "2"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "che_21",
    "year": 2022,
    "topic": "inorganic-chemistry",
    "question": "The sulphide that is commonly used in coating electric fluorescent tubes is?",
    "options": [
      "iron(ii)sulphide",
      "tin(ii)sulphide",
      "Zinc sulphide",
      "lead(iv)sulphide"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_22",
    "year": 2021,
    "topic": "inorganic-chemistry",
    "question": "Oxygen is absent in?",
    "options": [
      "Kerosene",
      "Soil",
      "Glass",
      "Cement"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "che_23",
    "year": 2022,
    "topic": "organic-chemistry",
    "question": "The IUPAC nomenclature of the structure CH₃-C(Cl)(CH₃)-CH₂-CH₃ is?",
    "options": [
      "3-chloro-3-methylbutane",
      "2,2-dichloro-3-methylbutane",
      "3-methylchlorobutane",
      "2-chloro-2-methylbutane"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "che_24",
    "year": 2022,
    "topic": "inorganic-chemistry",
    "question": "The following non-metals form acidic oxides with oxygen except?",
    "options": [
      "phosphorus",
      "sulphur",
      "carbon",
      "chlorine"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "che_25",
    "year": 2021,
    "topic": "organic-chemistry",
    "question": "What is the IUPAC name for the following compound? HC≡CCH₃",
    "options": [
      "Acetylene",
      "Methyl acetylene",
      "Butanol",
      "Decanoic acid"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_26",
    "year": 2005,
    "topic": "states-of-matter",
    "question": "The gas that can be dried using concentrated Tetraoxosulphate (VI) acid is",
    "options": [
      "Ammonia",
      "Hydrogen bromide",
      "Sulphur (IV) oxide",
      "Hydrogen sulphide"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_27",
    "year": 2010,
    "topic": "separation-and-purification",
    "question": "Which of the following is an example of a mixture",
    "options": [
      "Blood",
      "Sand",
      "Washing soda",
      "Common salt"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "che_28",
    "year": 2022,
    "topic": "environmental-chemistry",
    "question": "Addition of charcoal to the filter bed of sand during water treatment for township supply is to?",
    "options": [
      "prevent goiter",
      "prevent tooth decay",
      "remove odour",
      "kill germs"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_29",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Which of the following can be obtained by fractional distillation?",
    "options": [
      "Nitrogen from liquid air",
      "Sodium Chloride from sea water",
      "Iodine from solution of Iodine in carbon tetrachloride",
      "Sulphur from the solution of sulphur in carbon disulphide"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "che_30",
    "year": 2004,
    "topic": "states-of-matter",
    "question": "When a solid substance disappears completely as a gas on heating, the substance is said to have under gone",
    "options": [
      "Evaporation",
      "Distillation",
      "Crystallization",
      "Sublimation"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "che_31",
    "year": 2021,
    "topic": "states-of-matter",
    "question": "A sample of any of the following substances disappears after some time when exposed to air like camphor, naphthalene, or dry ice. This phenomenon is called?",
    "options": [
      "Sublimation",
      "Evaporation",
      "Diffusion",
      "Radiation"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "che_32",
    "year": 2019,
    "topic": "organic-chemistry",
    "question": "A secondary alkanol can be oxidized to give an?",
    "options": [
      "alkanone",
      "alkyne",
      "alkanoic acid",
      "alkanal"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "che_33",
    "year": 2021,
    "topic": "separation-and-purification",
    "question": "Which one of the following is not a mixture?",
    "options": [
      "Air",
      "Mercury",
      "Milk",
      "Cement"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_34",
    "year": 2022,
    "topic": "inorganic-chemistry",
    "question": "On the basis of the electrochemical series, which of these ions will show the greater tendency to be discharged at the cathode in an electrolytic cell?",
    "options": [
      "Cu²⁺",
      "Sn²⁺",
      "Fe²⁺",
      "Zn²⁺"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "che_35",
    "year": 2002,
    "topic": "states-of-matter",
    "question": "Which of the following gases contains the least number of atoms at s.t.p",
    "options": [
      "4 moles of chlorine",
      "3 moles of ozone",
      "1 mole of butane",
      "7 moles of argon"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_36",
    "year": 2021,
    "topic": "inorganic-chemistry",
    "question": "What is the chemical name for the compound CuCO₃?",
    "options": [
      "Copper (iii) carbonate",
      "Copper (ii) carbonate",
      "Copper (i) carbonate",
      "Copper"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_37",
    "year": 2022,
    "topic": "states-of-matter",
    "question": "Addition of sodium chloride to water to form a solution would lead to?",
    "options": [
      "increase in freezing point and increase the boiling point",
      "increase in freezing point and decrease the boiling point",
      "decrease in freezing point and decrease the boiling point",
      "decrease in freezing point and increase the boiling point"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "che_38",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "When water drops are added to calcium carbide in a container and the gas produced is passed through a jet and lighted, the resultant flame is called an?",
    "options": [
      "Oxyethene",
      "Oxyhydrocarbon flame",
      "Oxyacetylene flame",
      "Oxymethane flame"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_39",
    "year": 2022,
    "topic": "inorganic-chemistry",
    "question": "Using the metal activity series, the metal that can liberate hydrogen gas from steam is?",
    "options": [
      "iron",
      "copper",
      "tin",
      "lead"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "che_40",
    "year": 2021,
    "topic": "inorganic-chemistry",
    "question": "Which of the following is a non-metal that remains liquid at room temperature?",
    "options": [
      "Chlorine",
      "Phosphorus",
      "Bromine",
      "Helium"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "che_41",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "8g of CH₄ occupies 11.2 dm³ at S.T.P. What volume would 22g of CH₃CH₂CH₃ occupy under the same condition?",
    "options": [
      "3.7dm³",
      "11.2dm³",
      "22.4dm³",
      "33dm³"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_42",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Which of the gas laws does this graph illustrate?",
    "options": [
      "Boyle",
      "Charles",
      "Gay-Lussac",
      "Graham"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_43",
    "year": 2022,
    "topic": "energetics",
    "question": "N₂O₄ ⇌ 2NO₂ (Δ = -ve). From the reaction above, which of these conditions would produce the highest equilibrium yield for N₂O₄?",
    "options": [
      "Low temperature and high pressure",
      "Low temperature and low pressure",
      "High temperature and low pressure",
      "High temperature and high pressure"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "che_44",
    "year": 2021,
    "topic": "atomic-structure",
    "question": "The maximum number of electrons in the N shell is?",
    "options": [
      "2",
      "8",
      "18",
      "32"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "che_45",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "What process would coal undergo to give coal gas, coal tar, ammoniacal liquor and coke?",
    "options": [
      "Steam distillation",
      "Destructive distillation",
      "Liquefication",
      "Hydrolysis"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_46",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Four elements P, Q, R and S have atomic numbers of 4, 10, 12 and 14 respectively. Which of these elements is a noble gas?",
    "options": [
      "P",
      "Q",
      "R",
      "S"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_47",
    "year": 2022,
    "topic": "organic-chemistry",
    "question": "An organic compound which liberates carbon(iv)oxide from trioxocarbonate(iv) solution is likely to be?",
    "options": [
      "C₂H₅OH",
      "C₃H₄",
      "C₆H₆",
      "CH₃COOH"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "che_48",
    "year": 2022,
    "topic": "inorganic-chemistry",
    "question": "A chemical widely used as a fertilizer is?",
    "options": [
      "galena",
      "bauxite",
      "emerald",
      "nitrochalk"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "che_49",
    "year": 2016,
    "topic": "inorganic-chemistry",
    "question": "In an electrochemical cell, polarization is caused by",
    "options": [
      "Oxygen",
      "Hydrogen",
      "Tetraoxosulphate (IV) acid",
      "Chlorine"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "che_50",
    "year": 2022,
    "topic": "inorganic-chemistry",
    "question": "In the preparation of salts, the method employed will depend on the?",
    "options": [
      "composition",
      "dissociating ability",
      "stability to heat",
      "precipitating ability"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  }
];
