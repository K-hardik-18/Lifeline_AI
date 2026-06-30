<div align="center">
  <img src="https://img.shields.io/badge/Groq_AI-Powered-F55036?style=for-the-badge&logo=groq" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Framer_Motion-Animated-FF4785?style=for-the-badge&logo=framer" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  
  <br />
  <br />

  <h1>⚡ LifeLine AI ⚡</h1>
  <p><strong>The Ultimate, Context-Aware AI Productivity Companion for Students, Engineers, and Deep Workers</strong></p>
  <p><em>An intelligent task manager that doesn't just store your to-dos — it thinks, plans, writes, and focuses for you.</em></p>
</div>

<hr/>

## 📖 Introduction: What is LifeLine AI?

In today's fast-paced digital world, students and professionals face an epidemic of digital distraction, extreme procrastination, and overwhelming task lists. Between balancing assignments, personal projects, looming deadlines, and exams, it is incredibly easy to fall into the vicious cycle of "Last-Minute Panic." 

**LifeLine AI** is not just another to-do list app. It is a completely autonomous, intelligent digital life-saver. LifeLine acts as your personal AI executive assistant. It goes beyond simply storing your tasks; it actively understands the context of your workload, intelligently breaks down impossibly large projects into bite-sized actionable steps, drafts your difficult emails to professors or bosses, and actively forces you into focused deep-work sessions when the clock is ticking. 

Whether you are a university student managing finals week, an ADHD-driven creator trying to find focus, or a software engineer trying to ship a massive project, LifeLine AI gives you the structural support, cognitive relief, and momentum you need to succeed without burnout.

---

## 🚀 What It Can Do & Core Benefits

LifeLine AI tackles the root causes of procrastination and lack of productivity through advanced AI integration. 

### 🌟 Core Benefits
* **Completely Cures Procrastination:** The biggest hurdle to productivity is the mental friction of starting a huge task. By automatically breaking huge tasks into tiny pieces, the mental barrier to starting is completely eliminated.
* **Massively Reduces Cognitive Load:** You no longer have to wake up and decide what to do next. The AI Briefing and Chat analyze your deadlines and do the thinking for you.
* **Forces Uninterrupted Deep Work:** The immersive fullscreen Focus Mode physically removes digital distractions from your line of sight — no tabs, no bookmarks, no notifications.
* **Saves Hours of Busywork:** Writing update emails, requesting deadline extensions, and formatting tasks takes seconds instead of minutes with the built-in AI Drafts.
* **Creates Accountability:** By tracking your completions and overdue tasks visually, you stay accountable to your own goals.
* **Smart Date Validation:** Prevents impossible dates from being saved (e.g., June 31st doesn't exist) and notifies you with a friendly warning so you never create broken deadlines.

---

## 🛠️ Comprehensive Tech Stack 

LifeLine AI is built with modern, cutting-edge web technologies, designed for maximum performance, buttery smooth UI/UX, and robust API integration.

| Technology | Role in Project | Description |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Fullstack Framework | Powers the core routing, SSR, and API endpoints. Ensures lightning-fast page loads and robust backend serverless functions. |
| **React 18** | UI Library | Handles the complex, state-driven front-end components and context management. |
| **Groq Cloud (LLaMA 3.3 70B)** | AI Engine | The "Brain" of LifeLine AI. Accessed via the Groq SDK, it powers all natural language processing — task parsing, breakdown, chat, briefings, and draft generation — at blazing-fast inference speeds. |
| **Framer Motion** | Animation Engine | Drives the spring-physics micro-interactions, layout animations, and fluid transitions that make the app feel premium and alive. |
| **Vanilla CSS & CSS Variables** | Styling System | Hand-crafted CSS utilizing a custom HSL color palette and Glassmorphism techniques, ensuring perfect light-mode aesthetics without heavy CSS frameworks. |
| **Lucide React** | Iconography | Provides crisp, scalable, and semantic SVG icons throughout the dashboard. |
| **Marked.js** | Content Parsing | Safely parses AI-generated Markdown into beautiful, rich-text HTML for the Chat, Daily Briefing, and Drafts views. |
| **Web Audio API** | Synthesizer | Custom-built audio synthesizer that generates precise, mechanical "tick-tick" sounds and loud 3-beep alarms entirely in the browser without needing any MP3 files. |
| **Browser Fullscreen API** | Immersive Focus | Leverages the native `requestFullscreen()` API to completely take over the screen during work sessions, hiding all browser chrome and OS distractions. |

---

## 🎯 Massive Feature Breakdown

LifeLine AI is packed with 10+ deeply integrated features. Here is a deep dive into every single capability:

### 🧠 1. The Intelligent AI Daily Briefing
**What it is:** A dynamic dashboard widget that greets you every day with a personalized schedule.  
**How it works:** When you open the dashboard, the AI securely reads your entire database of tasks, cross-references their due dates with your **exact local time and timezone**, and generates a highly personalized, rich-text daily briefing formatted in beautiful Markdown.  
**Why it matters:** It tells you exactly what to tackle first, sets an encouraging tone for the day, and warns you about impending deadlines before it's too late.

### ⚡ 2. AI "Smart Auto-Fill" for Tasks
**What it is:** The fastest way to add complex tasks.  
**How it works:** Instead of manually selecting dates, categories, and priorities, you simply type a messy thought like *"I need to write my 10-page history essay by Friday at 5pm."* Click the ✨ Auto-Fill button, and the AI instantly extracts the title, sets the category to "Study", predicts it will take 180 minutes, and sets the priority to "Critical".  
**Why it matters:** Removes the friction of data entry so you can get tasks out of your head and into the system instantly.

### 🔍 3. 1-Click AI Task Breakdown
**What it is:** A cure for overwhelming projects.  
**How it works:** If you have a massive task (e.g., "Build a full-stack web app"), you can click the purple Sparkles icon next to it. The AI will analyze the scope of the task and generate a step-by-step checklist of micro-tasks (e.g., "1. Setup repo, 2. Build Navbar, 3. Connect DB").  
**Why it matters:** Actionable micro-steps release dopamine when checked off, keeping you motivated throughout the day.

### 🎯 4. True Fullscreen Focus Mode (Pomodoro 2.0)
**What it is:** A custom-built Pomodoro timer on steroids.  
**How it works:** 
- **Adjustable Ratios:** Set your ideal Work/Break ratio (e.g., 25/5 or 50/10). A motivational tip is displayed: *"The ideal focus ratio is 25:5 for maximum productivity."*
- **True Fullscreen Engine:** When you start a Work session, the app uses the native browser Fullscreen API to take over your **entire screen**, hiding all browser tabs, bookmarks, and OS taskbars. A massive clock fills the screen.
- **Tick-Tick Audio Synthesizer:** A custom Web Audio engine generates a subtle, rhythmic ticking sound every second to anchor you in the "flow state."
- **Loud 3-Beep Alarm:** When your session ends, a synthesized 3-beep sawtooth alarm rings loudly to pull you back — even if you walked away from your computer.
- **Smart Auto-Cycle:** Work → alarm → auto-exits fullscreen → break runs on normal page → alarm → STOPS. No infinite loop. You consciously start the next cycle when you're ready.

### ✏️ 5. Full Task Editing
**What it is:** Complete control over every task.  
**How it works:** Every task has a pencil (Edit) icon. Clicking it opens the full modal pre-filled with all the task's current data — title, description, due date, category, priority, and estimated time. You can change anything and hit "Save Task" to update it instantly.  
**Why it matters:** If the AI auto-filled something incorrectly, or if your plans changed, you have full freedom to adjust everything.

### 🛡️ 6. Smart Date Validation
**What it is:** Protection against impossible dates.  
**How it works:** If you (or the AI) sets a due date like "June 31st" (which doesn't exist), the app catches this before saving and shows a friendly warning: *"⚠️ That date doesn't exist (e.g. June only has 30 days). Please pick a valid date."*  
**Why it matters:** Prevents broken deadlines and confusing calendar entries.

### 🤖 7. Context-Aware AI Chat
**What it is:** A conversational AI assistant living in your task manager.  
**How it works:** The chat window has full, real-time context of your pending tasks, completed tasks, priorities, and **current local time**. All AI responses are rendered in rich Markdown with proper formatting, headers, and bullet points.  
**Why it matters:** You can ask it highly specific questions like, *"I only have 30 minutes before my next class, what should I work on right now?"* and it will give you a mathematically and logically sound recommendation.

### ✍️ 8. AI Drafts & Templates Engine
**What it is:** An automated writing assistant.  
**How it works:** Choose a template (like "Deadline Extension", "Project Update", or "Cold Email") or type a custom prompt. The AI will instantly generate a polished, professional draft formatted natively in beautiful rich-text Markdown. You can copy it with one click.  
**Why it matters:** Eliminates the anxiety of writing difficult emails to professors or managers. Also maintains a full history of all generated drafts.

### 📊 9. Visual Productivity Analytics
**What it is:** A real-time tracking dashboard.  
**How it works:** Features beautiful, animated charts showing your completion rates, category breakdowns (Work vs. Personal vs. Study vs. Finance vs. Health), and priority distributions (Critical, High, Medium, Low). Also shows a list of recently completed tasks with relative timestamps.  
**Why it matters:** Seeing your completion ring fill up over time gamifies your productivity and helps you recognize your work patterns.

### 📅 10. Heatmap Calendar with Auto-Scroll
**What it is:** A GitHub-style activity heatmap for your deadlines.  
**How it works:** Every day of the month is color-coded based on how many tasks are due that day (0, 1, 2, 3+). When you click on a day, the page automatically smooth-scrolls down to reveal a detailed panel showing all tasks scheduled for that specific date with their priorities, categories, and due times.  
**Why it matters:** Gives you a bird's-eye view of your entire month so you can plan ahead and avoid overloading specific days.

### 🛡️ 11. Robust Rate-Limit Protection
**What it is:** Enterprise-grade error handling for the AI backend.  
**How it works:** All AI API calls are wrapped in an automatic retry system with exponential backoff. If the Groq API returns a 429 (rate limit) error, the app waits progressively longer and retries up to 3 times, all silently in the background.  
**Why it matters:** Your app will never crash or show a broken screen during a live demo, even under heavy usage.

---

## 📖 User Manual: How to Use LifeLine AI

LifeLine AI is incredibly intuitive. Here is your complete quick-start guide:

### Step 1: Add Your First Task
1. Navigate to the **Tasks** tab in the top navigation bar.
2. Click **+ Add Task**.
3. In the Title box, type a brain-dump of what you need to do (e.g., "Finish the calculus assignment due tomorrow night").
4. Click the **✨ Auto-Fill with AI** button. Watch the AI magically fill out the Description, Due Date, Category, and Priority for you.
5. Review and edit any fields if needed.
6. Click **Save Task**.

### Step 2: Use AI Smart Add (Quick Method)
1. On the Tasks page, find the **AI Smart Add** bar at the very top.
2. Type naturally: *"Submit physics lab report by Thursday 5pm high priority"*.
3. Press Enter or click the arrow. The AI parses it and adds the task instantly!

### Step 3: Break Down Overwhelming Tasks
1. Find a large task in your list.
2. Click the **Purple Sparkles Icon** (✨) next to the task.
3. Wait 2 seconds while the AI analyzes it. 
4. A customized, step-by-step checklist of sub-tasks will appear directly under the main task. Check them off one by one!

### Step 4: Edit Any Task
1. Click the **Pencil Icon** (✏️) next to any task.
2. Modify the title, description, due date, category, priority, or estimated time.
3. Click **Save Task** to update.

### Step 5: Get Your Morning Briefing
1. Click the **Dashboard** tab.
2. Read your custom AI Briefing for a personalized summary of your day, including time-aware scheduling.
3. If things change, click the **Refresh** icon on the card to get a brand new, updated briefing.

### Step 6: Enter Deep Work (Focus Mode)
1. Navigate to the **Focus Mode** tab.
2. Click the **Gear (⚙️)** icon to adjust your Work and Break minutes (default is 25:5).
3. Select the task you want to work on from the list on the right.
4. Click **Start**. Your entire screen will go completely black, the massive timer will begin, and the mechanical ticking will help you focus. 
5. When the loud alarm sounds after your work session, the browser will automatically exit fullscreen so you can take your break. The break timer runs on the normal page.
6. When the break ends, the alarm sounds again and the timer stops — you decide when to start the next cycle.

### Step 7: Ask the AI for Help
1. Navigate to the **AI Chat** tab.
2. Ask a question like, *"Look at my tasks. Which one is the absolute highest priority today?"*
3. The AI will instantly read your task list, understand the current time, and give you a beautifully formatted answer.

### Step 8: Generate Professional Drafts
1. Navigate to the **Drafts** tab.
2. Pick a template (e.g., "Deadline Extension Request") or write a custom prompt.
3. Click **Generate**. The AI will produce a polished, copy-ready draft.
4. Click **Copy** to paste it into your email client.

### Step 9: Track Your Progress
1. Navigate to the **Analytics** tab.
2. View your completion rate ring, category breakdown bars, priority distribution, and recent completions.

### Step 10: Plan with the Calendar
1. Navigate to the **Calendar** tab.
2. Browse months using the arrow buttons.
3. Click on any day to see all tasks due on that date. The page will auto-scroll to the task list.

---

## 🚀 Getting Started (Installation for Developers)

To run LifeLine AI locally on your machine, follow these simple steps:

### 1. Clone & Install
Open your terminal and run:
```bash
git clone https://github.com/K-hardik-18/Lifeline_AI.git
cd Lifeline_AI
npm install
```

### 2. Set Up Environment Variables
You need a Groq API Key for the AI features to work.
1. Go to [Groq Console](https://console.groq.com/) and sign up for a free account.
2. Generate an API key from the dashboard.
3. Create a `.env.local` file in the root directory of this project.
4. Add your key exactly like this:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser and let the AI take control of your productivity!

---

## 🎨 Design Philosophy

We abandoned the generic, blocky layouts of traditional task managers. LifeLine AI is built to feel premium, fluid, and alive:

- **Vibrant Gradients** paired with a sleek, modern light-mode aesthetic.
- **Spring-Physics Micro-Interactions** powered by Framer Motion so every click, hover, and transition feels tactile and responsive.
- **Harmonious HSL Color Palette** with curated accents for each priority level, category, and UI state.
- **Glassmorphism Cards** with subtle backdrop blur and layered depth effects.
- **Custom Synthesized Audio** — no generic notification sounds. Every tick and alarm is generated live via the Web Audio API.
- **Zero External Images** — the entire UI is built with vector icons, gradients, and CSS, keeping the bundle size tiny and load times instant.

---

## 📂 Project Structure

```
lifeline-ai/
├── src/
│   ├── app/
│   │   ├── api/ai/           # All AI API routes (chat, breakdown, draft, parse-task, daily-brief, prioritize)
│   │   ├── globals.css       # Master stylesheet with design tokens
│   │   ├── layout.js         # Root layout with fonts and metadata
│   │   └── page.js           # Main app shell with view routing
│   ├── components/
│   │   ├── Dashboard.js      # AI Daily Briefing + stats overview
│   │   ├── TaskManager.js    # Full task CRUD + AI Smart Add + Breakdown + Edit
│   │   ├── FocusView.js      # Fullscreen Pomodoro with audio engine
│   │   ├── ChatView.js       # Context-aware AI chat
│   │   ├── CalendarView.js   # Heatmap calendar with auto-scroll
│   │   ├── Analytics.js      # Completion tracking and charts
│   │   ├── DraftView.js      # AI writing assistant with templates
│   │   └── Sidebar.js        # Top navigation bar
│   ├── context/
│   │   └── TaskContext.js     # Global state management with localStorage persistence
│   └── lib/
│       └── gemini.js          # Groq SDK client with retry logic
├── .env.local                 # Environment variables (not committed)
├── package.json
└── README.md
```

---

<div align="center">
  <p>Built with ❤️ to cure procrastination forever.</p>
  <p><em>LifeLine AI — Because your productivity deserves an AI that actually understands you.</em></p>
</div>
