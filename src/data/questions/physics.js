export const physicsQuestions = [
  {
    id: "phy_01",
    year: 2023,
    topic: "Mechanics - Projectiles",
    question: "A projectile is launched with an initial velocity of 50 m/s at an angle of 30° to the horizontal. Calculate the maximum height attained. [Take g = 10 m/s²]",
    options: [
      "25.25 m",
      "31.25 m",
      "45.00 m",
      "62.50 m"
    ],
    answer: 1,
    explanation: "H_max = (u² sin² θ) / (2g) = (50² × sin² 30°) / (2 × 10) = (2500 × 0.25) / 20 = 625 / 20 = 31.25 m.",
    difficulty: "medium"
  },
  {
    id: "phy_02",
    year: 2023,
    topic: "Current Electricity",
    question: "Three resistors of resistances 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their effective total resistance?",
    options: [
      "1.0 Ω",
      "2.5 Ω",
      "5.0 Ω",
      "11.0 Ω"
    ],
    answer: 0,
    explanation: "1/R_total = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1 Ω⁻¹ → R_total = 1.0 Ω.",
    difficulty: "easy"
  },
  {
    id: "phy_03",
    year: 2023,
    topic: "Waves & Optics",
    question: "A ray of light traveling from glass (refractive index = 1.5) into air undergoes total internal reflection when the angle of incidence exceeds the critical angle c. Find sin(c).",
    options: [
      "0.50",
      "0.67",
      "0.75",
      "1.50"
    ],
    answer: 1,
    explanation: "sin(c) = 1/n = 1/1.5 = 2/3 ≈ 0.67.",
    difficulty: "easy"
  },
  {
    id: "phy_04",
    year: 2022,
    topic: "Thermodynamics",
    question: "How much thermal energy is required to raise the temperature of 2 kg of copper from 20°C to 70°C? [Specific heat capacity of copper = 400 J/(kg·K)]",
    options: [
      "40,000 J",
      "50,000 J",
      "60,000 J",
      "80,000 J"
    ],
    answer: 0,
    explanation: "Q = mcΔT = 2 kg × 400 J/(kg·K) × (70 − 20) K = 800 × 50 = 40,000 J.",
    difficulty: "easy"
  },
  {
    id: "phy_05",
    year: 2022,
    topic: "Modern Physics & Radioactivity",
    question: "A radioactive isotope has a half-life of 4 hours. If a freshly prepared sample contains 80 g of the isotope, what mass remains undecayed after 16 hours?",
    options: [
      "2.5 g",
      "5.0 g",
      "10.0 g",
      "20.0 g"
    ],
    answer: 1,
    explanation: "Number of half-lives n = 16 / 4 = 4. Remaining mass = 80 / (2⁴) = 80 / 16 = 5.0 g.",
    difficulty: "medium"
  },
  {
    id: "phy_06",
    year: 2021,
    topic: "Gravitational Fields",
    question: "If the distance between two masses each of 100 kg is doubled, the gravitational force of attraction between them:",
    options: [
      "Doubles",
      "Halves",
      "Reduces by a factor of 4",
      "Remains constant"
    ],
    answer: 2,
    explanation: "By Newton's Universal Law of Gravitation, F ∝ 1/r². If distance r is doubled (2r), F becomes 1/(2)² = 1/4th of the initial value.",
    difficulty: "easy"
  },
  {
    id: "phy_07",
    year: 2021,
    topic: "Electromagnetism",
    question: "Faraday's law of electromagnetic induction states that the magnitude of the induced electromotive force (e.m.f.) is directly proportional to the:",
    options: [
      "Resistance of the coil circuit",
      "Rate of change of magnetic flux linkage",
      "Electrostatic potential difference",
      "Temperature of the conducting medium"
    ],
    answer: 1,
    explanation: "Faraday's law states that induced e.m.f. E = −N (dΦ/dt), directly proportional to the time rate of change of magnetic flux.",
    difficulty: "easy"
  },
  {
    id: "phy_08",
    year: 2020,
    topic: "Simple Harmonic Motion (SHM)",
    question: "The period of oscillation T of a simple pendulum is doubled when its length L is:",
    options: [
      "Doubled",
      "Halved",
      "Increased fourfold",
      "Decreased to one quarter"
    ],
    answer: 2,
    explanation: "T = 2π √(L/g). For T to double (2T), L must increase by 2² = 4 times.",
    difficulty: "medium"
  },
  {
    id: "phy_09",
    year: 2020,
    topic: "Capacitors & Electrostatics",
    question: "Two capacitors of capacitances 4 μF and 6 μF are connected in series across a 100 V DC source. Calculate the equivalent capacitance.",
    options: [
      "10.0 μF",
      "2.4 μF",
      "1.5 μF",
      "0.4 μF"
    ],
    answer: 1,
    explanation: "In series: 1/C_eq = 1/C₁ + 1/C₂ = 1/4 + 1/6 = 5/12 → C_eq = 12/5 = 2.4 μF.",
    difficulty: "medium"
  },
  {
    id: "phy_10",
    year: 2019,
    topic: "Elasticity & Hooke's Law",
    question: "A spiral spring is extended by 0.05 m when a mass of 2 kg hangs freely from it. Calculate the work done in stretching the spring. [g = 10 m/s²]",
    options: [
      "0.25 J",
      "0.50 J",
      "1.00 J",
      "2.50 J"
    ],
    answer: 1,
    explanation: "Force F = mg = 2 × 10 = 20 N. Work done W = (1/2) F e = 0.5 × 20 N × 0.05 m = 0.50 J.",
    difficulty: "medium"
  }
];
