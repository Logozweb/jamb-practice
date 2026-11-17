export const physicsQuestions = [
  {
    "id": "phy_01",
    "year": 2023,
    "topic": "Mechanics - Projectiles",
    "question": "A projectile is launched with an initial velocity of 50 m/s at an angle of 30° to the horizontal. Calculate the maximum height attained. [Take g = 10 m/s²]",
    "options": [
      "25.25 m",
      "31.25 m",
      "45.00 m",
      "62.50 m"
    ],
    "answer": 1,
    "explanation": "H_max = (u² sin² θ) / (2g) = (50² × sin² 30°) / (2 × 10) = (2500 × 0.25) / 20 = 625 / 20 = 31.25 m.",
    "difficulty": "medium"
  },
  {
    "id": "phy_02",
    "year": 2023,
    "topic": "Current Electricity",
    "question": "Three resistors of resistances 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their effective total resistance?",
    "options": [
      "1.0 Ω",
      "2.5 Ω",
      "5.0 Ω",
      "11.0 Ω"
    ],
    "answer": 0,
    "explanation": "1/R_total = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1 Ω⁻¹ → R_total = 1.0 Ω.",
    "difficulty": "easy"
  },
  {
    "id": "phy_03",
    "year": 2023,
    "topic": "Waves & Optics",
    "question": "A ray of light traveling from glass (refractive index = 1.5) into air undergoes total internal reflection when the angle of incidence exceeds the critical angle c. Find sin(c).",
    "options": [
      "0.50",
      "0.67",
      "0.75",
      "1.50"
    ],
    "answer": 1,
    "explanation": "sin(c) = 1/n = 1/1.5 = 2/3 ≈ 0.67.",
    "difficulty": "easy"
  },
  {
    "id": "phy_04",
    "year": 2022,
    "topic": "Thermodynamics",
    "question": "How much thermal energy is required to raise the temperature of 2 kg of copper from 20°C to 70°C? [Specific heat capacity of copper = 400 J/(kg·K)]",
    "options": [
      "40,000 J",
      "50,000 J",
      "60,000 J",
      "80,000 J"
    ],
    "answer": 0,
    "explanation": "Q = mcΔT = 2 kg × 400 J/(kg·K) × (70 − 20) K = 800 × 50 = 40,000 J.",
    "difficulty": "easy"
  },
  {
    "id": "phy_05",
    "year": 2022,
    "topic": "Modern Physics & Radioactivity",
    "question": "A radioactive isotope has a half-life of 4 hours. If a freshly prepared sample contains 80 g of the isotope, what mass remains undecayed after 16 hours?",
    "options": [
      "2.5 g",
      "5.0 g",
      "10.0 g",
      "20.0 g"
    ],
    "answer": 1,
    "explanation": "Number of half-lives n = 16 / 4 = 4. Remaining mass = 80 / (2⁴) = 80 / 16 = 5.0 g.",
    "difficulty": "medium"
  },
  {
    "id": "phy_06",
    "year": 2021,
    "topic": "Gravitational Fields",
    "question": "If the distance between two masses each of 100 kg is doubled, the gravitational force of attraction between them:",
    "options": [
      "Doubles",
      "Halves",
      "Reduces by a factor of 4",
      "Remains constant"
    ],
    "answer": 2,
    "explanation": "By Newton's Universal Law of Gravitation, F ∝ 1/r². If distance r is doubled (2r), F becomes 1/(2)² = 1/4th of the initial value.",
    "difficulty": "easy"
  },
  {
    "id": "phy_07",
    "year": 2021,
    "topic": "Electromagnetism",
    "question": "Faraday's law of electromagnetic induction states that the magnitude of the induced electromotive force (e.m.f.) is directly proportional to the:",
    "options": [
      "Resistance of the coil circuit",
      "Rate of change of magnetic flux linkage",
      "Electrostatic potential difference",
      "Temperature of the conducting medium"
    ],
    "answer": 1,
    "explanation": "Faraday's law states that induced e.m.f. E = −N (dΦ/dt), directly proportional to the time rate of change of magnetic flux.",
    "difficulty": "easy"
  },
  {
    "id": "phy_08",
    "year": 2020,
    "topic": "Simple Harmonic Motion (SHM)",
    "question": "The period of oscillation T of a simple pendulum is doubled when its length L is:",
    "options": [
      "Doubled",
      "Halved",
      "Increased fourfold",
      "Decreased to one quarter"
    ],
    "answer": 2,
    "explanation": "T = 2π √(L/g). For T to double (2T), L must increase by 2² = 4 times.",
    "difficulty": "medium"
  },
  {
    "id": "phy_09",
    "year": 2020,
    "topic": "Capacitors & Electrostatics",
    "question": "Two capacitors of capacitances 4 μF and 6 μF are connected in series across a 100 V DC source. Calculate the equivalent capacitance.",
    "options": [
      "10.0 μF",
      "2.4 μF",
      "1.5 μF",
      "0.4 μF"
    ],
    "answer": 1,
    "explanation": "In series: 1/C_eq = 1/C₁ + 1/C₂ = 1/4 + 1/6 = 5/12 → C_eq = 12/5 = 2.4 μF.",
    "difficulty": "medium"
  },
  {
    "id": "phy_10",
    "year": 2019,
    "topic": "Elasticity & Hooke's Law",
    "question": "A spiral spring is extended by 0.05 m when a mass of 2 kg hangs freely from it. Calculate the work done in stretching the spring. [g = 10 m/s²]",
    "options": [
      "0.25 J",
      "0.50 J",
      "1.00 J",
      "2.50 J"
    ],
    "answer": 1,
    "explanation": "Force F = mg = 2 × 10 = 20 N. Work done W = (1/2) F e = 0.5 × 20 N × 0.05 m = 0.50 J.",
    "difficulty": "medium"
  },
  {
    "id": "phy_11",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "If a source of solid is moving, a stationary listener will hear a sound of different frequency. This is called?",
    "options": [
      "doppler effect",
      "resonance",
      "ultra sound",
      "rarefaction"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "phy_12",
    "year": 2021,
    "topic": "heat",
    "question": "0.5kg of water at 10°C is completely converted to ice at 0°C by extracting 88000J of heat from it. If the specific heat capacity of water is 4200 Jkg⁻¹°C⁻¹, calculate the specific latent heat of fusion of ice.",
    "options": [
      "9.0 kJkg⁻¹",
      "84.0 kJkg⁻¹",
      "134.0 kJkg⁻¹",
      "168.0 kJkg⁻¹"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "phy_13",
    "year": 2023,
    "topic": "waves",
    "question": "The property of wave shown in the diagram above is?",
    "options": [
      "Diffraction",
      "Refraction",
      "Polarisation",
      "Interference"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "phy_14",
    "year": 2021,
    "topic": "heat",
    "question": "Calculate the heat energy required to vaporize 50g of water initially at 80°C if the specific heat capacity of water is 4.2 Jg⁻¹K⁻¹ (specific latent heat of vaporization of water is 2260 Jg⁻¹)",
    "options": [
      "530,000 J",
      "23,200 J",
      "17,200 J",
      "130,000 J"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "phy_15",
    "year": 2024,
    "topic": "mechanics",
    "question": "The stress experienced by a wire of diameter yπm loaded by a weight y²N is",
    "options": [
      "πNm⁻²",
      "2πNm⁻²",
      "4πNm⁻²",
      "8πNm⁻²"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "phy_16",
    "year": 2021,
    "topic": "mechanics",
    "question": "The motion of a body is simple harmonic if the?",
    "options": [
      "acceleration is always directed towards a fixed point",
      "path of motion is a straight line",
      "acceleration is proportional to the square of the distance from a fixed point",
      "acceleration is constant and directed towards a fixed point"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "phy_17",
    "year": 2005,
    "topic": "mechanics",
    "question": "Marching soldiers crossing a suspension bridge are usually advised to break their steps to avoid damaging the bridge owing to",
    "options": [
      "oscillation",
      "resonance",
      "swinging",
      "vibration"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_18",
    "year": 2022,
    "topic": "electricity",
    "question": "A bar magnet is divided into two pieces, which of the following statement is correct?",
    "options": [
      "two new magnets are created",
      "the magnetic field of each separate piece becomes stronger",
      "the electric field is created",
      "the bar magnet is demagnetized"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "phy_19",
    "year": 2022,
    "topic": "waves",
    "question": "A tuning fork having a frequency of 312 Hz emits a wave which has a wavelength of 1.10 m. Calculate the velocity of sound.",
    "options": [
      "312.0 ms⁻¹",
      "110.0 ms⁻¹",
      "343.2 ms⁻¹",
      "686.4 ms⁻¹"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_20",
    "year": 2022,
    "topic": "waves",
    "question": "The secondary pigments consist of?",
    "options": [
      "blue, green, and violet",
      "yellow, green, and magenta",
      "magenta, yellow, and cyan",
      "red, green, and blue"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_21",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Tha mass of a proton is approximately equal to that of",
    "options": [
      "an α\n-particle",
      "a β\n-Particle",
      "a neutron",
      "an electron"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_22",
    "year": 2006,
    "topic": "mechanics",
    "question": "A uniform solid cube material 10cm on each side of mass 700g is submerged in water. which of the following best described the behavior of the cube water?",
    "options": [
      "the cube will melt after a period of time",
      "the cube will float",
      "the cube will sink in water",
      "the cube will rest at an equilibrium position in water"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "hard"
  },
  {
    "id": "phy_23",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Natural radioactivity consists of emission?",
    "options": [
      "α\n -particles and β\n-rays",
      "α\n-particles and X-rays",
      "γ\n -ray and X-rays",
      "α\n -particles and β\n-rays and γ\n-rays"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "phy_24",
    "year": 2021,
    "topic": "mechanics",
    "question": "A ball of mass 0.5kg moving at 10ms⁻¹ collides with another ball of equal mass at rest. If the two balls move off together after the impact, calculate their common velocity.",
    "options": [
      "0.2 ms⁻¹",
      "0.5 ms⁻¹",
      "5.0 ms⁻¹",
      "5.5 ms⁻¹"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "phy_25",
    "year": 2022,
    "topic": "waves",
    "question": "An object 40 cm high is 30cm from the pin hole camera. If the height of the image formed is 20 cm. What is the distance of the image from the pin height?",
    "options": [
      "15 cm",
      "70 cm",
      "40 cm",
      "60 cm"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "hard"
  },
  {
    "id": "phy_26",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "In the study of Physics, temperature and heat are often confused with each other. Which of the following statements correctly defines these two elements?",
    "options": [
      "Temperature is a measure of the average kinetic energy of the molecules of a substance",
      "Heat is a measure of the total kinetic energy of the molecules in a system",
      "Different materials require different amounts of heat to cause a given change in temperature",
      "All of the above"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "phy_27",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "In what range of temperature is the expansion of water anomalous?",
    "options": [
      "+208°C to +212°C",
      "-80°C to -76°C",
      "0°C to +4°C",
      "-4°C to +0°C"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_28",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "If in a simple pendulum experiment the length of the inextensible string is increased by a factor of four, its period is increased by a factor of?",
    "options": [
      "4",
      "π²",
      "1/4",
      "2"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "medium"
  },
  {
    "id": "phy_29",
    "year": 2022,
    "topic": "mechanics",
    "question": "Tyres are treaded to?",
    "options": [
      "increase weight of tyres",
      "increase friction",
      "increase its longevity",
      "look good"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_30",
    "year": 2021,
    "topic": "measurement",
    "question": "Which of the units of the following physical quantities are derived?\n\nI. Area\nII. Thrust\nIII. Pressure\nIV. Mass",
    "options": [
      "I, II, III and IV",
      "I, II, and III only",
      "I, II, and IV only",
      "I and IV only"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_31",
    "year": 2022,
    "topic": "modern-physics",
    "question": "An isotope has an initial activity of 120 Bq. 6 days later its activity is 15 Bq. The half-life is?",
    "options": [
      "3 days",
      "2 days",
      "1 day",
      "4 days"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "hard"
  },
  {
    "id": "phy_32",
    "year": 2022,
    "topic": "electricity",
    "question": "A bar magnet is placed near and lying along the axis of a solenoid connected to a galvanometer. The pointer of the galvanometer shows no deflection when?",
    "options": [
      "the magnet is moved towards the stationary solenoid",
      "there is no relative motion",
      "the magnet is moved away from the stationary solenoid",
      "the solenoid is moved away from the stationary magnet"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "hard"
  },
  {
    "id": "phy_33",
    "year": 2016,
    "topic": "waves",
    "question": "Myopic defects in the human eye can be corrected through the use of a",
    "options": [
      "Concave Mirror",
      "Concave lens",
      "Prism",
      "Convex lens"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_34",
    "year": 2022,
    "topic": "electricity",
    "question": "Which of the following is not a consequence of hydrogen bubbles covering the copper plate of a primary cell?",
    "options": [
      "formation of hydrogen bubbles on the electrode",
      "increase in the resistance of the cell",
      "local action",
      "polarization"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_35",
    "year": 2021,
    "topic": "mechanics",
    "question": "The slope of the straight line displacement-time graph indicates?",
    "options": [
      "distance traveled",
      "uniform velocity",
      "uniform acceleration",
      "uniform speed"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_36",
    "year": 2021,
    "topic": "waves",
    "question": "A source of sound produces waves in air of wavelength 1.65m. If the speed of sound in air is 330ms⁻¹, the period of vibration in air is?",
    "options": [
      "200 s",
      "0.005 s",
      "0.5 s",
      "0.02 s"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_37",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Which of the following statements on the use of X-rays is incorrect? X-rays are used",
    "options": [
      "In a hospital to obtain photographs of tissues and bones in the body",
      "For the treatment of malignant growths like cancer cells",
      "In detecting fingerprints",
      "To reveal hidden flaws in metal castings and welded joints work of art"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_38",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "A machine gun with a mass of 5kg fires a 50g bullet at a speed of 100 ms⁻¹. The recoil speed of the machine gun is",
    "options": [
      "0.5 ms⁻¹",
      "1.5 ms⁻¹",
      "1 ms⁻¹",
      "2 ms⁻¹"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_39",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "Which of the following can be described as high tension transmission?",
    "options": [
      "High resistance and low voltage",
      "Low current and high voltage",
      "High current and low voltage",
      "High current and low resistance"
    ],
    "answer": 1,
    "explanation": "Official UTME past examination answer is Option B.",
    "difficulty": "medium"
  },
  {
    "id": "phy_40",
    "year": 2021,
    "topic": "measurement",
    "question": "Which of the following is not a vector quantity?",
    "options": [
      "momentum",
      "force",
      "temperature",
      "displacement"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_41",
    "year": 2022,
    "topic": "heat",
    "question": "The relationship between the coefficient of linear expansion α and volumetric expansion (γ) is-----------------",
    "options": [
      "γ = α⁻³",
      "γ = α",
      "γ = 3α",
      "γ = α³"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_42",
    "year": 2021,
    "topic": "waves",
    "question": "A boy standing some distance from the foot of a tall cliff claps his hands and hears an echo 0.5s later. If the speed of sound is 340ms⁻¹, how far is he from the cliff?",
    "options": [
      "680m",
      "170m",
      "34m",
      "85m"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "phy_43",
    "year": 2021,
    "topic": "modern-physics",
    "question": "If the frequency of an emitted x-ray is 1.6 × 10¹⁶ Hz, the accelerating potential is?\n[e = 1.6 × 10⁻¹⁹ C, h = 6.63 × 10⁻³⁴ Js]",
    "options": [
      "6630.0V",
      "663.0V",
      "66.3V",
      "6.6V"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "phy_44",
    "year": 2021,
    "topic": "heat",
    "question": "Which of the following instruments may be used to measure relative humidity?",
    "options": [
      "Hydrometer",
      "Manometer",
      "Hygrometer",
      "Hypsometer"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_45",
    "year": 2015,
    "topic": "states-of-matter",
    "question": "If the volume of a gas is recorded as 76cm³ at a temperature of 27°C with a pressure of 800mmHg. What will be the volume of the gas at S.T.P?",
    "options": [
      "36.2cm³",
      "25.7cm³",
      "72.8cm³",
      "24.3cm³"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "hard"
  },
  {
    "id": "phy_46",
    "year": 2022,
    "topic": "electricity",
    "question": "Which of the following liquid is a poor conductor of electricity?",
    "options": [
      "Distilled water",
      "Tap water",
      "Sea water",
      "Drinking water"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "phy_47",
    "year": 2020,
    "topic": "Authentic Past Question",
    "question": "The force required to make an object of mass m, travelling with velocity v, turn in a circle of radius r is",
    "options": [
      "mv²/r",
      "mr²/v",
      "mrv",
      "mv/r²"
    ],
    "answer": 0,
    "explanation": "Official UTME past examination answer is Option A.",
    "difficulty": "medium"
  },
  {
    "id": "phy_48",
    "year": 2022,
    "topic": "mechanics",
    "question": "A car starts from rest and covers a distance of 40 m in 10 s. Calculate the magnitude of its acceleration.",
    "options": [
      "3.20 ms⁻²",
      "0.25 ms⁻²",
      "0.80 ms⁻²",
      "4.00 ms⁻²"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  },
  {
    "id": "phy_49",
    "year": 2020,
    "topic": "heat",
    "question": "A few grains of table salt were put in a cup of cold water, kept at constant temperature and left undistributed. Eventually all the water tested salty. This action is due to?",
    "options": [
      "convection",
      "osmosis",
      "capillarity",
      "diffusion"
    ],
    "answer": 3,
    "explanation": "Official UTME past examination answer is Option D.",
    "difficulty": "hard"
  },
  {
    "id": "phy_50",
    "year": 2022,
    "topic": "measurement",
    "question": "Which of these is a derived unit?",
    "options": [
      "Kilogram",
      "Metre",
      "Newton",
      "Second"
    ],
    "answer": 2,
    "explanation": "Official UTME past examination answer is Option C.",
    "difficulty": "medium"
  }
];
