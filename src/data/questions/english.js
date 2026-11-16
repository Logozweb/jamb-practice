export const englishQuestions = [
  // Comprehension Passage 1 (Questions 1 - 5)
  {
    id: "eng_01",
    year: 2023,
    topic: "Reading Comprehension",
    passage: {
      title: "Passage I: The Rise of Artificial Intelligence in African Agriculture",
      text: `In recent decades, sub-Saharan Africa has faced persistent agricultural challenges ranging from unpredictable rainfall patterns to severe pest infestations. However, the burgeoning adoption of digital technologies, specifically Artificial Intelligence (AI) and remote sensing drones, is fostering a quiet revolution across smallholder farms.\n\nBy leveraging predictive algorithms, agricultural startups can now analyze hyper-local soil moisture levels, forecast localized weather variations, and detect early symptoms of crop blight before visible manifestations emerge. For instance, farmers in Kenya and Nigeria utilizing mobile-based computer vision tools have reported up to a thirty percent reduction in post-harvest losses. \n\nNevertheless, the widespread proliferation of these technological advancements remains hampered by infrastructural bottlenecks. Chief among these is the prohibitive cost of broadband internet access in rural hinterlands, coupled with widespread digital illiteracy among aging pastoralist and farming demographics. Without concerted public sector intervention to subsidize digital infrastructure and foster grassroots capacity building, the technological divide may paradoxically exacerbate socioeconomic disparities rather than bridge them.`
    },
    question: "According to the passage, the primary benefit of computer vision tools to farmers in Nigeria and Kenya is:",
    options: [
      "Immediate eradication of agricultural pest species",
      "Noticeable reduction in post-harvest crop losses",
      "Total replacement of human labor in pastoral communities",
      "Unconditional federal subsidies for farm fertilizers"
    ],
    answer: 1,
    explanation: "The passage explicitly states: 'farmers in Kenya and Nigeria utilizing mobile-based computer vision tools have reported up to a thirty percent reduction in post-harvest losses.'",
    difficulty: "medium"
  },
  {
    id: "eng_02",
    year: 2023,
    topic: "Reading Comprehension",
    passageId: "eng_01", // refers to the same passage above
    question: "The author's attitude towards the future of AI in African agriculture can best be described as:",
    options: [
      "Uncritically optimistic and dismissive of limitations",
      "Cautiously hopeful but mindful of systemic impediments",
      "Thoroughly cynical and indifferent to technological change",
      "Vehemently hostile toward Western technological intrusion"
    ],
    answer: 1,
    explanation: "The author recognizes the clear benefits (reduction in crop loss) while concurrently warning about infrastructural bottlenecks like digital illiteracy and expensive internet.",
    difficulty: "hard"
  },
  {
    id: "eng_03",
    year: 2023,
    topic: "Reading Comprehension",
    passageId: "eng_01",
    question: "The word 'proliferation' as used in the third paragraph most nearly means:",
    options: [
      "Rapid spread or multiplication",
      "Sudden termination or decay",
      "Secretive and illegal distribution",
      "Excessive financial cost"
    ],
    answer: 0,
    explanation: "'Proliferation' means rapid increase in number or widespread reproduction/spread.",
    difficulty: "medium"
  },
  {
    id: "eng_04",
    year: 2023,
    topic: "Reading Comprehension",
    passageId: "eng_01",
    question: "Which of the following is highlighted as a principal obstacle to digital farming adoption?",
    options: [
      "Incessant urban flooding in capital cities",
      "Extravagant wages demanded by tech developers",
      "Prohibitive costs of broadband internet in rural localities",
      "Complete disinterest among international donor organizations"
    ],
    answer: 2,
    explanation: "The text states: 'Chief among these is the prohibitive cost of broadband internet access in rural hinterlands...'",
    difficulty: "easy"
  },
  {
    id: "eng_05",
    year: 2023,
    topic: "Reading Comprehension",
    passageId: "eng_01",
    question: "The author warns that failure to address digital illiteracy could result in:",
    options: [
      "A complete collapse of metropolitan stock markets",
      "Widening socioeconomic disparities between demographic segments",
      "Universal ban on drone navigation systems across West Africa",
      "Compulsory relocation of rural inhabitants to major cities"
    ],
    answer: 1,
    explanation: "The author concludes: 'the technological divide may paradoxically exacerbate socioeconomic disparities rather than bridge them.'",
    difficulty: "medium"
  },
  // Lexis and Structure: Nearest in Meaning / Synonyms
  {
    id: "eng_06",
    year: 2022,
    topic: "Synonyms",
    question: "In the sentence: 'The director's METICULOUS attention to detail averted a catastrophic financial audit,' the word METICULOUS means:",
    options: [
      "Careless and hasty",
      "Painstaking and thorough",
      "Aggressive and unreasonable",
      "Secretive and dubious"
    ],
    answer: 1,
    explanation: "'Meticulous' means showing great attention to detail; very careful and precise.",
    difficulty: "easy"
  },
  {
    id: "eng_07",
    year: 2022,
    topic: "Synonyms",
    question: "Choose the word nearest in meaning to the underlined word: 'The government issued a BLATANT denial regarding the fuel subsidy report.'",
    options: [
      "Unmistakable and glaring",
      "Subtle and disguised",
      "Hesitant and unsure",
      "Polite and diplomatic"
    ],
    answer: 0,
    explanation: "'Blatant' describes bad behavior or statement done openly and unashamedly; glaringly obvious.",
    difficulty: "medium"
  },
  {
    id: "eng_08",
    year: 2022,
    topic: "Antonyms",
    question: "Choose the word OPPOSITE in meaning to the capitalized word: 'The judge considered the witness's testimony entirely IRRELEVANT to the murder charges.'",
    options: [
      "Immaterial",
      "Pertinent",
      "Insignificant",
      "Unrelated"
    ],
    answer: 1,
    explanation: "The opposite of 'irrelevant' is 'pertinent' (relevant or applicable to a particular matter).",
    difficulty: "medium"
  },
  {
    id: "eng_09",
    year: 2021,
    topic: "Grammar & Concord",
    question: "Choose the option that best completes the sentence: 'Neither the principal nor the teachers _______ present at the inter-house sports banquet yesterday.'",
    options: [
      "was",
      "were",
      "is",
      "are"
    ],
    answer: 1,
    explanation: "Under the rule of proximity for 'neither... nor', the verb agrees with the closer subject. 'Teachers' is plural and past tense, requiring 'were'.",
    difficulty: "medium"
  },
  {
    id: "eng_10",
    year: 2021,
    topic: "Grammar & Concord",
    question: "Select the grammatically correct sentence:",
    options: [
      "One of the candidates have forgotten their admission letter.",
      "One of the candidates has forgotten his or her admission letter.",
      "One of the candidates have forgotten his admission letter.",
      "One of the candidate has forgotten their admission letter."
    ],
    answer: 1,
    explanation: "'One of the [plural noun]' takes a singular verb ('has') and singular pronoun ('his or her').",
    difficulty: "medium"
  },
  {
    id: "eng_11",
    year: 2020,
    topic: "Idioms & Phrasal Verbs",
    question: "To 'burn the midnight oil' means to:",
    options: [
      "Waste valuable fuel through negligence",
      "Work or study late into the night",
      "Ignite a fire in an open dwelling",
      "Refuse to compromise with adversaries"
    ],
    answer: 1,
    explanation: "The idiom 'burn the midnight oil' means to stay up late working or studying.",
    difficulty: "easy"
  },
  {
    id: "eng_12",
    year: 2020,
    topic: "Oral Forms & Phonology",
    question: "Which of the following words contains the same vowel sound as that in the word 'plumb' /ʌ/?",
    options: [
      "Tomb",
      "Flood",
      "Comb",
      "Womb"
    ],
    answer: 1,
    explanation: "'Flood' has the short central vowel sound /ʌ/ just like 'plumb' /plʌm/ and 'blood' /blʌd/.",
    difficulty: "hard"
  },
  {
    id: "eng_13",
    year: 2019,
    topic: "Oral Forms & Phonology",
    question: "Identify the word that has the primary stress on the SECOND syllable:",
    options: [
      "PHOTOGRAPH",
      "PHOTOGRAPHER",
      "PHOTOGRAPHIC",
      "PHOTOGRAM"
    ],
    answer: 1,
    explanation: "pho-TO-gra-pher has primary stress placed on the second syllable /fəˈtɒɡrəfə/.",
    difficulty: "hard"
  },
  {
    id: "eng_14",
    year: 2019,
    topic: "Grammar & Prepositions",
    question: "The panel congratulated the victorious debater _______ her exceptional eloquence.",
    options: [
      "for",
      "on",
      "at",
      "with"
    ],
    answer: 1,
    explanation: "The standard collocated preposition with 'congratulate' is 'on' (congratulate someone ON something).",
    difficulty: "easy"
  },
  {
    id: "eng_15",
    year: 2018,
    topic: "Sentence Interpretation",
    question: "'Had she known the flight was delayed, Amina would not have rushed to the airport.' This means that:",
    options: [
      "Amina knew about the delay and still rushed to the airport",
      "Amina did not know about the delay, so she rushed to the airport",
      "Amina refused to rush because she was notified on time",
      "The airline prevented Amina from arriving at the terminal"
    ],
    answer: 1,
    explanation: "The third conditional indicates that Amina was unaware of the delay in reality, which caused her to rush.",
    difficulty: "medium"
  }
];
