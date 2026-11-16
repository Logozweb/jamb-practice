# JAMB UTME CBT Examination Portal & Simulator (Official Clone)

An ultra-realistic, authentic clone of the official **Joint Admissions and Matriculation Board (JAMB) Unified Tertiary Matriculation Examination (UTME) Computer-Based Testing (CBT)** system, re-engineered from the ground up for prospective candidates (**JAMBITES**).

Built using **React + Vite + Tailwind CSS**.

---

## 🎯 Key Features: True JAMB UTME Experience

### 1. Authentic 4-Subject Combination System
- Real JAMB candidates never sit for just 1 subject. They take **Use of English** (mandatory) + **3 chosen faculty electives**.
- Includes preset combinations for:
  - **Medicine & Health Sciences** (English, Biology, Chemistry, Physics)
  - **Engineering & Technology** (English, Mathematics, Physics, Chemistry)
  - **Law & Legal Studies** (English, Literature, Government, Economics)
  - **Accounting & Business Administration** (English, Mathematics, Economics, Commerce)
  - **Political Science & Social Sciences** (English, Government, Literature, Economics)
  - **Custom combinations** across all major UTME subjects.
- **In-Exam Subject Tabs**: Seamlessly toggle between all 4 subjects at any point during the 2 hours.

### 2. The Official JAMB "8-Key System"
To prepare candidates for test centres where mice may be absent or malfunctioning, the entire simulator can be navigated using only the keyboard:
- **`A`**: Select Option A
- **`B`**: Select Option B
- **`C`**: Select Option C
- **`D`**: Select Option D
- **`P`**: Previous Question
- **`N`**: Next Question
- **`S`**: Submit Examination (opens confirmation)
- **`R`**: Review / Flag Question (or Cancel / Return from submit)
- **Bonus shortcuts**:
  - `1`, `2`, `3`, `4`: Instantly switch between your 4 registered subjects.
  - `Alt + C`: Open the On-Screen Calculator.

### 3. On-Screen JAMB Calculator
- Floating, non-intrusive calculator mirroring the official UTME test software.
- Standard 4-function operations (`+`, `-`, `×`, `÷`), square roots (`√`), percentages (`%`), sign negation (`±`), and clear/backspace.

### 4. Split-Screen Reading Comprehension
- For Use of English and Literature passages, the screen automatically switches into a side-by-side view:
  - **Left Pane**: Reading passage / extract with comfortable serif typography.
  - **Right Pane**: Question and options A–D.

### 5. Simple Practice Registration & e-Facility Portal
- **Fast 15-Second Sign-Up**:
  - Full Name, Email, Password, and Target Course / Faculty.
  - Automatic background generation of candidate's simulated JAMB Registration Number (`2026XXXXXXXXEB`), Profile Code, CBT Exam Centre, and allocated Seat Number.
  - Immediate entry into the examination hall or dashboard with zero friction.
- **Official JAMB e-Facility Portal (`efacility.jamb.gov.ng` clone)**: Candidate profile, live mock test launch, exam history, and printable registration e-Slip.
- **JAMB CAPS Portal**: Central Admissions Processing System with "Accept Offer" and "Reject Offer" simulations.

### 7. Real Live JAMB API (ALOC Station Integration)
- Integrated with the **ALOC Past Questions API** (`aloc.com.ng`), the standard Nigerian past questions API.
- Live API mode pulls authentic past questions dynamically for all registered subjects.
- **Dual-Engine Architecture**:
  - 🌐 **Real Live ALOC API**: Connect your ALOC access token to pull live past questions across years (1997–2024).
  - ⚡ **Offline Verified Archive**: 100% offline fallback so candidates can practice seamlessly without internet connection or API rate-limit interruptions.
  - Configurable via the **"Question API"** button in the dashboard or exam setup.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Running Locally
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:3000` to start practicing.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```
Jamb Practice/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── context/
│   │   └── ExamContext.jsx          # Unified multi-subject timer, 8-key listener, exam state
│   ├── data/
│   │   ├── subjects.js              # UTME subjects & faculty combination presets
│   │   └── questions/               # Authentic question banks by subject
│   │       ├── english.js           # Includes comprehension passages & lexis/structure
│   │       ├── mathematics.js       # Calculus, indices, trigonometry, algebra
│   │       ├── physics.js           # Mechanics, waves, electricity, modern physics
│   │       ├── chemistry.js         # Stoichiometry, organic, equilibrium, redox
│   │       ├── biology.js           # Genetics, ecology, cell biology, physiology
│   │       ├── economics.js         # Elasticity, national income, monetary policy
│   │       ├── government.js        # Constitutions, arms of govt, international relations
│   │       ├── literature.js        # Poetic devices, drama, literary terms
│   │       ├── commerce.js          # International trade, insurance, banking
│   │       └── index.js             # Question retrieval & pool management
│   └── components/
│       ├── Header.jsx               # Candidate bio, live countdown timer, utility tools
│       ├── SubjectTabs.jsx          # 4-Subject switcher with progress badges
│       ├── QuestionView.jsx         # Question stem, options A-D, split-screen passage view
│       ├── QuestionPalette.jsx      # 1-60 question dot grid (Answered, Flagged, Unanswered)
│       ├── BottomNav.jsx            # Prev, Next, Submit & 8-Key visual toolbar
│       ├── OnscreenCalculator.jsx   # Interactive popup calculator
│       ├── SubmitModal.jsx          # Comprehensive 4-subject attempt summary confirmation
│       ├── EightKeyGuide.jsx        # Keyboard guide for candidate orientation
│       ├── SetupModal.jsx           # Bio setup & 4-subject combo selection
│       ├── InstructionsScreen.jsx   # Official pre-exam candidate instructions hall
│       └── ResultSlip.jsx           # Printable JAMB Result Slip & solution review
```
