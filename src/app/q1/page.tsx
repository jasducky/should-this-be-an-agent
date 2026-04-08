"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { generateResultsPdf } from "../generate-pdf";

// ─── Question Data ───────────────────────────────────────────────

interface Question {
  id: number;
  question: string;
  shortLabel: string;
  why: string;
  thinkAbout: string;
  options: string[];
  weight: number;
  scoring: "linear" | "bell" | "inverted";
}

const questions: Question[] = [
  // ─── Block 1: Is the task right for AI? ─────────────────────────
  {
    id: 1,
    question: "How much human interpretation does this process need?",
    shortLabel: "Interpretation needed",
    why: "This is the code\u2013AI\u2013human spectrum. Code handles structured logic, humans handle complex judgement, and agents fill the middle, where inputs are unstructured but the decision logic is clear enough to follow rules.",
    thinkAbout:
      "Could you write a decision tree for every scenario? If yes, code can handle it and you don\u2019t need AI.",
    options: [
      "Purely rules-based, no ambiguity",
      "Mostly rules, occasional edge cases",
      "Mix of rules and interpretation",
      "Significant interpretation required",
      "Requires deep expertise and judgement",
    ],
    weight: 1.5,
    scoring: "bell",
  },
  {
    id: 2,
    question: "How variable are the inputs?",
    shortLabel: "Input variability",
    why: "This is about edge case density: how many exceptions exist per standard case. AI earns its place when inputs can\u2019t be captured by fixed templates, dropdown menus, or structured forms.",
    thinkAbout:
      "If you built a form with dropdown menus, could it capture every possible input? If not, that\u2019s where AI adds value.",
    options: [
      "Always the same format",
      "Mostly consistent, minor variations",
      "Moderate variation",
      "Highly variable",
      "Wildly different each time",
    ],
    weight: 1.0,
    scoring: "linear",
  },
  // ─── Block 2: Can you build it? ─────────────────────────────────
  {
    id: 3,
    question: "How much of the process is already documented?",
    shortLabel: "Process documentation",
    why: "PMs call this the bus factor. If your expert left tomorrow, could someone else do their job from the docs? Undocumented processes are full of tribal knowledge that\u2019s hard to automate and harder to test.",
    thinkAbout:
      "Is there a process map, decision tree, or even a checklist? Or does it all live in someone\u2019s head?",
    options: [
      "Lives entirely in people\u2019s heads",
      "Partially documented, lots of tribal knowledge",
      "Core process documented, edge cases aren\u2019t",
      "Well documented with some gaps",
      "Fully mapped with decision trees",
    ],
    weight: 1.0,
    scoring: "linear",
  },
  {
    id: 4,
    question: "Do you have access to the data the agent would need?",
    shortLabel: "Data readiness",
    why: "Data readiness is the most common technical reason AI projects stall. If the data your agent needs is scattered across systems, incomplete, or locked behind access barriers, that\u2019s a problem to solve before the build starts, not during it.",
    thinkAbout:
      "Where does the data live? Can you access it? Is it in a state you could work with, or would it need significant cleaning or restructuring first?",
    options: [
      "We don\u2019t know what data it would need",
      "The data exists but it\u2019s scattered across systems",
      "The data exists and is mostly accessible",
      "The data is accessible and reasonably clean",
      "The data is accessible, clean, and we understand its structure",
    ],
    weight: 1.0,
    scoring: "linear",
  },
  {
    id: 5,
    question:
      "Is there a human who currently does this and can validate the agent\u2019s work?",
    shortLabel: "Human validator",
    why: "In AI products, this is about ground truth: having someone who can verify whether the agent\u2019s output is correct. A human validator gives you a way to establish what \u2018right\u2019 looks like, catch issues early, and build confidence in the system over time.",
    thinkAbout:
      "Who would check the agent\u2019s work? Would they spot it if the agent got something subtly wrong?",
    options: [
      "No one does this today",
      "Someone did, but they\u2019ve moved on",
      "Yes, but they\u2019re too busy to review",
      "Yes, they could spot-check regularly",
      "Yes, they\u2019re ready and willing to validate",
    ],
    weight: 1.25,
    scoring: "linear",
  },
  // ─── Block 3: Does the investment make sense? ───────────────────
  {
    id: 6,
    question: "What\u2019s the volume?",
    shortLabel: "Volume",
    why: "This is unit economics for AI. Every agent interaction has a per-use cost (inference, retrieval, retries, moderation), and the true cost per task is typically 10\u201350\u00d7 the posted API price. Low volume rarely pays back.",
    thinkAbout:
      "What would each interaction cost? Multiply by volume, then compare to the current human cost for the same work.",
    options: [
      "A few per week",
      "A few per day",
      "Dozens per day",
      "Hundreds per day",
      "Thousands or more per day",
    ],
    weight: 0.75,
    scoring: "linear",
  },
  {
    id: 7,
    question: "Does the business case hold up at current AI costs?",
    shortLabel: "Business case",
    why: "This is your viability gate, not a full business case but a sanity check. If you haven\u2019t modelled cost-to-serve against the value created, you\u2019re investing based on excitement rather than evidence.",
    thinkAbout:
      "Can you estimate: cost per AI interaction \u00d7 expected volume vs. current human cost for the same work?",
    options: [
      "Haven\u2019t thought about it",
      "Rough idea, not confident",
      "Estimated, looks reasonable",
      "Modelled with assumptions",
      "Detailed analysis, clear ROI",
    ],
    weight: 1.0,
    scoring: "linear",
  },
  {
    id: 8,
    question: "What happens when it gets it wrong?",
    shortLabel: "Consequence of errors",
    why: "This is where you run a pre-mortem: \u2018Imagine this agent has been live for three months and something has gone wrong. What happened?\u2019 Understanding the consequences upfront helps you design the right level of guardrails and human oversight.",
    thinkAbout:
      "Run a quick pre-mortem: what\u2019s the most likely thing to go wrong? Who would notice, and how quickly?",
    options: [
      "Minor inconvenience, easily fixed",
      "Some wasted time or rework",
      "Customer-facing impact",
      "Significant financial or reputational impact",
      "Regulatory, legal, or safety consequences",
    ],
    weight: 1.5,
    scoring: "inverted",
  },
  // ─── Block 4: Is the organisation ready? ────────────────────────
  {
    id: 9,
    question:
      "Does leadership understand this won\u2019t be right 100% of the time?",
    shortLabel: "Leadership readiness",
    why: "Teams that align on \u2018good enough\u2019 before building have a much higher success rate. Only 12% of agent projects make it to production, and the ones that do tend to have leadership who understood from the start that AI is probabilistic, not perfect.",
    thinkAbout:
      "Has anyone asked: \u2018What error rate would we accept?\u2019 If that conversation hasn\u2019t happened, start there before building anything.",
    options: [
      "No, they expect perfection",
      "They say they understand but haven\u2019t been tested",
      "Some understanding, haven\u2019t discussed specifics",
      "Yes, we\u2019ve discussed acceptable error rates",
      "Yes, we\u2019ve agreed on specific tolerances",
    ],
    weight: 1.25,
    scoring: "linear",
  },
];

// ─── Scoring Logic ───────────────────────────────────────────────

const bellScoreMap: Record<number, number> = {
  1: 2,
  2: 4,
  3: 5,
  4: 5,
  5: 3,
};

const invertedScoreMap: Record<number, number> = {
  1: 5,
  2: 4,
  3: 3,
  4: 2,
  5: 1,
};

function getRawScore(value: number, scoring: Question["scoring"]): number {
  if (scoring === "bell") return bellScoreMap[value];
  if (scoring === "inverted") return invertedScoreMap[value];
  return value;
}

function getWeightedScore(value: number, question: Question): number {
  return getRawScore(value, question.scoring) * question.weight;
}

const maxWeightedScore = questions.reduce((sum, q) => sum + 5 * q.weight, 0);

interface TierResult {
  tier: 1 | 2 | 3;
  label: string;
  headline: string;
  description: string;
  nextSteps: string[];
}

function getTierNextSteps(tier: number, answers: Record<number, number>, warningInsights: { questionId: number; insight: string; type: "warning" | "strength" }[]): string[] {
  const warnings = warningInsights.filter((w) => w.type === "warning");
  const hasWarnings = warnings.length > 0;
  const warningQuestions = new Set(warnings.map((w) => w.questionId));
  const steps: string[] = [];

  if (tier === 1) {
    if (hasWarnings) {
      steps.push("Address the areas flagged above — each one needs a specific plan before you move forward");
    }
    // Actionable Tier 1 steps
    steps.push("Test your assumptions: find 100\u2013200 historical examples of this task and check whether an AI could reproduce the human decision");
    steps.push("Share this result with your team so everyone starts with the same understanding of what\u2019s involved");
    steps.push("The next step is Question 2: understanding the real process behind this use case. Sign up below and we\u2019ll send it when it\u2019s ready");
    return steps;
  }

  if (tier === 2) {
    // Warning-specific actionable steps
    if (warningQuestions.has(3)) {
      steps.push("Document the process first: shadow the person who does this for a full cycle and write down every decision they make, including the edge cases");
    }
    if (warningQuestions.has(4)) {
      steps.push("Audit your data: map what the agent would need, where it lives, and what state it\u2019s in. Data gaps are the most common technical blocker.");
    }
    if (warningQuestions.has(7)) {
      steps.push("Build a simple business case: (cost per AI interaction \u00d7 expected volume) vs. the current human cost for the same work");
    }
    if (warningQuestions.has(5)) {
      steps.push("Identify a validator: find someone who can check the agent\u2019s work during a pilot, even if it\u2019s just spot-checking 10% of outputs");
    }
    if (warningQuestions.has(8)) {
      steps.push("Map your risk: run a pre-mortem with your team and define kill criteria \u2014 what would make you shut the agent down?");
    }
    if (warningQuestions.has(9)) {
      steps.push("Have the \u2018good enough\u2019 conversation with leadership: agree on what error rate would be acceptable before investing in a build");
    }
    if (!hasWarnings) {
      steps.push("Your scores show potential across the board. Share this with your team as a starting point for the conversation");
    }
    steps.push("The next step is Question 2: breaking the process down to see which parts suit AI and which don\u2019t. Sign up below and we\u2019ll send it when it\u2019s ready");
    return steps;
  }

  // Tier 3
  if ((answers[1] ?? 0) <= 2) {
    steps.push("This process is rules-based enough for workflow automation (tools like Zapier, Make, n8n) or RPA \u2014 explore those first");
  } else {
    steps.push("Consider workflow automation for the structured parts of this process, and keep the judgement-heavy parts with humans for now");
  }
  if (warningQuestions.has(3)) {
    steps.push("Before automating anything: document the process. Shadow the person who does this and capture every decision, especially the edge cases");
  }
  if ((answers[8] ?? 0) >= 4) {
    steps.push("For high-consequence processes, involve your compliance or legal team before evaluating any automation \u2014 they\u2019ll have requirements you need to design for");
  }
  if (hasWarnings) {
    steps.push("The areas flagged above are worth addressing regardless of the solution you choose");
  }
  steps.push("If parts of this process might still suit AI, try the assessment again with a narrower scope \u2014 focus on one specific sub-task rather than the whole process");
  return steps;
}

function getTierResult(percentage: number, answers: Record<number, number>, warnings: { questionId: number; insight: string; type: "warning" | "strength" }[]): TierResult {
  const warningCount = warnings.filter((w) => w.type === "warning").length;

  // ─── Override 1: Task-fit floor ───────────────────────────────
  // If interpretation AND variability are both very low, this isn't an agent task
  // regardless of how ready the organisation is.
  const lowTaskFit = (answers[1] ?? 0) <= 1 && (answers[2] ?? 0) <= 1;
  if (lowTaskFit && percentage >= 45) {
    return {
      tier: 3,
      label: "Not an Agent",
      headline: "This is better solved with automation, not an AI agent.",
      description:
        "Your process is rules-based with consistent inputs — that\u2019s a strength, not a limitation. Tools like OCR, RPA, or workflow automation can handle this more reliably and at lower cost than an AI agent. Your organisation\u2019s readiness is a genuine asset — it means any automation project is likely to succeed.",
      nextSteps: [],
    };
  }

  // ─── Override 2: Danger combination ───────────────────────────
  // When multiple severe warnings combine with high consequences,
  // force Tier 3 regardless of score.
  const highConsequences = (answers[8] ?? 0) >= 4;
  if (warningCount >= 4 && highConsequences && percentage >= 45) {
    return {
      tier: 3,
      label: "Not an Agent",
      headline: "Don\u2019t build this agent yet.",
      description:
        "The task itself may suit AI, but the conditions aren\u2019t in place to build it safely. Too many critical factors — documentation, validation, business case, leadership alignment — are missing at the same time, and the consequences of getting it wrong are severe. Address the areas flagged below before reconsidering.",
      nextSteps: [],
    };
  }

  // ─── Override 3: Score-warning contradiction ──────────────────
  // If the rules-based warning fires, cap at Tier 2 with reframed messaging.
  const ruleBasedWarning = (answers[1] ?? 0) <= 2;
  if (ruleBasedWarning && percentage >= 70) {
    return {
      tier: 2,
      label: "Automation First",
      headline: "Strong automation candidate — but an AI agent may not be the right tool.",
      description:
        "Your use case scores well on organisation readiness, consequences, and validation — all signs of a project likely to succeed. But the process itself is mostly rules-based, which means structured automation (RPA, workflow tools, or document processing) may handle it better than an AI agent. Evaluate those options first — if the edge cases still need AI interpretation, consider a hybrid approach.",
      nextSteps: [],
    };
  }

  if (percentage >= 70) {
    return {
      tier: 1,
      label: "Agent-Shaped",
      headline: "This looks like a strong candidate for an AI agent.",
      description:
        "Your use case has the right mix: enough interpretation to need AI, manageable risk, and an organisation that\u2019s ready for it. The business case and validation path are there.",
      nextSteps: [],
    };
  }

  // ─── Override 4: Uniform moderate scores ──────────────────────
  // Detect all-middle answers and reframe from "solid" to "needs investigation"
  const answerValues = Object.values(answers);
  const allModerate = answerValues.length === questions.length &&
    answerValues.every((v) => v === 3);
  if (allModerate) {
    return {
      tier: 2,
      label: "Hybrid",
      headline: "Parts of this suit AI. Parts don\u2019t.",
      description:
        "Your scores are moderate across the board, which often means the use case needs deeper investigation. Try exploring each question in more detail — where you\u2019re uncertain, that\u2019s where the real answer is hiding. Consider re-taking this after a closer look at your process.",
      nextSteps: [],
    };
  }

  if (percentage >= 45) {
    return {
      tier: 2,
      label: "Hybrid",
      headline: "Parts of this suit AI. Parts don\u2019t.",
      description:
        "Your use case has potential, but some factors need addressing first. The score breakdown below shows you which areas to focus on.",
      nextSteps: [],
    };
  }
  return {
    tier: 3,
    label: "Not an Agent",
    headline: "This is better solved without an AI agent.",
    description:
      "That\u2019s not a bad thing. It means you can solve this problem faster and cheaper with other tools. Agents add cost and complexity that this use case doesn\u2019t need right now.",
    nextSteps: [],
  };
}

function getQuestionInsights(
  answers: Record<number, number>
): { questionId: number; insight: string; type: "warning" | "strength" }[] {
  const insights: {
    questionId: number;
    insight: string;
    type: "warning" | "strength";
  }[] = [];

  // Q1 — Interpretation needed
  if (answers[1] <= 2)
    insights.push({
      questionId: 1,
      insight:
        "Your process is mostly rules-based. Workflow automation or RPA may be a better fit than an AI agent.",
      type: "warning",
    });
  if (answers[1] >= 5)
    insights.push({
      questionId: 1,
      insight:
        "Deep expertise requirements mean an agent alone won\u2019t be enough. Plan for significant human oversight.",
      type: "warning",
    });
  if (answers[1] >= 3 && answers[1] <= 4)
    insights.push({
      questionId: 1,
      insight:
        answers[1] === 3
          ? "A good mix of rules and interpretation \u2014 structured enough to define clear success criteria, flexible enough to need AI."
          : "Significant interpretation is where AI agents add the most value. Make sure you have enough examples to test against.",
      type: "strength",
    });

  // Q2 — Input variability
  if (answers[2] >= 4)
    insights.push({
      questionId: 2,
      insight:
        "Highly variable inputs are where AI shines \u2014 but also where it fails unpredictably. Check the quality of your input data: messy, incomplete, or inconsistent inputs will cap what any agent can do.",
      type: "warning",
    });
  if (answers[2] <= 1 && answers[1] <= 2)
    insights.push({
      questionId: 2,
      insight:
        "Consistent, structured inputs are a sign this process can be fully automated with rules \u2014 no AI interpretation needed.",
      type: "strength",
    });

  // Q3 — Process documentation
  if (answers[3] <= 2)
    insights.push({
      questionId: 3,
      insight:
        answers[3] === 1
          ? "This process lives entirely in people\u2019s heads. That\u2019s your first job: capture the knowledge before you can automate any of it."
          : "Partially documented with tribal knowledge gaps. Map out the undocumented decisions \u2014 those are where the agent will fail first.",
      type: "warning",
    });
  if (answers[3] >= 4)
    insights.push({
      questionId: 3,
      insight:
        answers[3] === 5
          ? "Fully mapped processes are the easiest to automate and the easiest to test. Your documentation is a genuine head start."
          : "Well-documented processes give you a strong foundation for building test cases and defining what \u2018right\u2019 looks like.",
      type: "strength",
    });

  // Q4 — Data readiness
  if (answers[4] === 1)
    insights.push({
      questionId: 4,
      insight:
        "You haven\u2019t identified what data the agent would need yet. Start there \u2014 until you know what data is required, you can\u2019t assess whether it\u2019s feasible to build.",
      type: "warning",
    });
  else if (answers[4] === 2)
    insights.push({
      questionId: 4,
      insight:
        "Data scattered across systems is the most common technical blocker for AI projects. Map what\u2019s needed, where it lives, and what it would take to bring it together before committing to a build.",
      type: "warning",
    });
  if (answers[4] === 5)
    insights.push({
      questionId: 4,
      insight:
        "Clean, accessible, well-understood data is a genuine advantage. It means you can move faster into prototyping and spend less time on data engineering.",
      type: "strength",
    });
  else if (answers[4] === 4)
    insights.push({
      questionId: 4,
      insight:
        "Accessible, reasonably clean data gives you a solid starting point. Budget some time for data prep, but it shouldn\u2019t be a blocker.",
      type: "strength",
    });

  // Q5 — Human validator
  if (answers[5] <= 2)
    insights.push({
      questionId: 5,
      insight:
        answers[5] === 1
          ? "No one does this today, which means no one can tell you if the agent got it right. You need ground truth before you can build."
          : "Your previous validator has moved on. Find someone who understands what \u2018correct\u2019 looks like \u2014 without that, you\u2019re flying blind.",
      type: "warning",
    });
  if (answers[5] >= 4)
    insights.push({
      questionId: 5,
      insight:
        answers[5] === 5
          ? "A willing, ready validator is rare and valuable. They\u2019ll be your quality backstop during the pilot \u2014 invest in keeping them engaged."
          : "Someone who can spot-check regularly gives you a feedback loop. Use it: structured reviews, not just ad-hoc checks.",
      type: "strength",
    });

  // Q6 — Volume
  // (No per-question insights — volume feeds the monitoring nudge below)

  // Q7 — Business case
  if (answers[7] <= 2)
    insights.push({
      questionId: 7,
      insight:
        answers[7] === 1
          ? "No cost modelling yet. Before building anything, estimate: (cost per AI interaction \u00d7 volume) vs. what you\u2019re spending now."
          : "A rough business case isn\u2019t enough to invest on. Sharpen it: what specifically does the agent save, and what does it cost to run?",
      type: "warning",
    });

  // Q8 — Consequence of errors
  if (answers[8] >= 4)
    insights.push({
      questionId: 8,
      insight:
        answers[8] >= 5
          ? "Regulatory or legal consequences mean any automation needs explainable reasoning, audit trails, and sign-off from your compliance and legal teams before you proceed."
          : "High consequences mean you\u2019ll need solid guardrails, monitoring, and mandatory human review for edge cases. Define your kill criteria before you build.",
      type: "warning",
    });
  if (answers[8] <= 2)
    insights.push({
      questionId: 8,
      insight:
        answers[8] === 1
          ? "Minor-inconvenience failures give you a safe environment to experiment. Use that \u2014 launch a pilot, learn fast, iterate."
          : "Errors here mean some rework, not real damage. That gives you room to iterate and improve the agent over time.",
      type: "strength",
    });

  // Q9 — Leadership readiness
  if (answers[9] <= 2)
    insights.push({
      questionId: 9,
      insight:
        answers[9] === 1
          ? "Leadership expects perfection. That\u2019s a project-stopper for AI. Have the \u2018what error rate would we accept?\u2019 conversation before investing."
          : "Leadership says they understand AI isn\u2019t perfect, but that hasn\u2019t been tested. Align on specific tolerances before the first demo.",
      type: "warning",
    });
  if (answers[9] >= 4)
    insights.push({
      questionId: 9,
      insight:
        answers[9] === 5
          ? "Agreed tolerances are the strongest foundation you can have. Most teams never get here \u2014 you\u2019re ahead of the curve."
          : "You\u2019ve discussed acceptable error rates, which puts you ahead of most teams. Formalise those numbers before the pilot starts.",
      type: "strength",
    });

  // ─── Tier 1 monitoring nudge ───────────────────────────────────
  // Every Tier 1 result should get at least one caution.
  // If no warnings have fired, add a general monitoring note.
  const totalWeighted = questions.reduce(
    (sum, q) => sum + getRawScore(answers[q.id], q.scoring) * q.weight,
    0
  );
  const pct = Math.round((totalWeighted / maxWeightedScore) * 100);
  if (pct >= 70 && insights.filter((i) => i.type === "warning").length === 0) {
    // Volume-aware monitoring prompt
    if (answers[6] >= 3) {
      insights.push({
        questionId: 6,
        insight:
          "At this volume, monitor for category drift and edge case accumulation. What works at launch can degrade over 3\u20136 months as the environment changes.",
        type: "warning",
      });
    } else {
      insights.push({
        questionId: 6,
        insight:
          "Even strong candidates need monitoring. Set a review cadence \u2014 check accuracy monthly for the first quarter, then adjust.",
        type: "warning",
      });
    }
  }

  return insights;
}

// ─── URL Encoding ────────────────────────────────────────────────

function encodeResults(answers: Record<number, number>): string {
  const values = questions.map((q) => answers[q.id] || 0);
  return btoa(values.join(","));
}

function decodeResults(hash: string): Record<number, number> | null {
  try {
    const decoded = atob(hash);
    const values = decoded.split(",").map(Number);
    if (values.length !== questions.length || values.some(isNaN)) return null;
    const answers: Record<number, number> = {};
    questions.forEach((q, i) => {
      if (values[i] >= 1 && values[i] <= 5) answers[q.id] = values[i];
    });
    return Object.keys(answers).length === questions.length ? answers : null;
  } catch {
    return null;
  }
}

// ─── Component ───────────────────────────────────────────────────

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pre-fill email from localStorage if available
    const savedEmail = localStorage.getItem("serpin_email");
    if (savedEmail) setEmail(savedEmail);

    // Restore results from URL hash if shared link
    const hash = window.location.hash.replace("#r=", "");
    if (hash) {
      const decoded = decodeResults(hash);
      if (decoded) {
        setAnswers(decoded);
        setShowResults(true);
        setIsSharedView(true);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setShowResults(true);
    const encoded = encodeResults(answers);
    window.history.replaceState(null, "", `#r=${encoded}`);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
    setIsSharedView(false);
    setEmailSubmitted(false);
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Persist email to localStorage for cross-page sharing
    localStorage.setItem("serpin_email", email);

    // Generate and download PDF
    generateResultsPdf({
      tier: tierResult.tier,
      tierLabel: tierResult.label,
      headline: tierResult.headline,
      description: tierResult.description,
      percentage,
      scores: questions.map((q) => ({
        label: q.shortLabel,
        score: getRawScore(answers[q.id], q.scoring),
      })),
      warnings: warnings.map(
        (w) =>
          `${questions.find((q) => q.id === w.questionId)?.shortLabel}: ${w.insight}`
      ),
      strengths: strengths.map(
        (s) =>
          `${questions.find((q) => q.id === s.questionId)?.shortLabel}: ${s.insight}`
      ),
      nextSteps,
    });

    // Send to server-side API route (which forwards to Encharge)
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tier: tierResult.tier,
          tierLabel: tierResult.label,
          percentage,
          scores: Object.fromEntries(
            questions.map((q) => [
              q.shortLabel,
              answers[q.id],
            ])
          ),
          source: "should-this-be-an-agent",
          assessmentUrl: shareUrl,
        }),
      });
    } catch {
      // Submission failure shouldn't block the user experience
    }

    setEmailSubmitted(true);
  };

  // Calculate results
  const totalWeightedScore = allAnswered
    ? questions.reduce((sum, q) => sum + getWeightedScore(answers[q.id], q), 0)
    : 0;
  const percentage = Math.round((totalWeightedScore / maxWeightedScore) * 100);
  const insights = allAnswered ? getQuestionInsights(answers) : [];
  const warnings = insights.filter((i) => i.type === "warning");
  const strengths = insights.filter((i) => i.type === "strength");
  const tierResult = getTierResult(percentage, answers, insights);
  const nextSteps = allAnswered
    ? getTierNextSteps(tierResult.tier, answers, insights)
    : [];

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#r=${encodeResults(answers)}`
      : "";

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="https://serpin.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/serpin-logo-black.png"
              alt="Serpin"
              width={80}
              height={20}
              className="h-5 w-auto"
            />
          </a>
          <span className="text-xs text-ink-muted">
            From the Agent Discovery and Design Framework
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
          Should This Be an Agent?
        </h1>
        <p className="mt-4 text-lg text-ink-light leading-relaxed max-w-2xl">
          Most processes aren&apos;t one thing. Some parts suit an agent, some
          suit code, some need a person. This assessment helps you see which is
          which.
        </p>
        <div className="mt-6 flex items-center gap-6 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            2 minutes
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            9 questions
          </span>
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Instant results
          </span>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
          <span>
            {answeredCount} of {questions.length} answered
          </span>
          {answeredCount > 0 && !allAnswered && (
            <span>{questions.length - answeredCount} remaining</span>
          )}
        </div>
        <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-serpin-yellow rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <section className="max-w-3xl mx-auto px-4 space-y-6 pb-8">
        {questions.map((q) => {
          const isAnswered = answers[q.id] !== undefined;
          return (
            <div
              key={q.id}
              className={`bg-white rounded-xl border transition-all duration-300 ${
                isAnswered
                  ? "border-serpin-yellow/40 shadow-sm"
                  : "border-ink/10"
              }`}
            >
              <div className="p-5 sm:p-6">
                {/* Question header */}
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isAnswered
                        ? "bg-serpin-yellow text-ink"
                        : "bg-cream-dark text-ink-muted"
                    }`}
                  >
                    {q.id}
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-ink leading-snug pt-0.5">
                    {q.question}
                  </h2>
                </div>

                {/* Why this matters */}
                <div className="ml-10 mb-4">
                  <p className="text-sm text-ink-light leading-relaxed">
                    {q.why}
                  </p>
                  <p className="text-sm text-ink-muted mt-1.5 italic">
                    Think about: {q.thinkAbout}
                  </p>
                </div>

                {/* Options */}
                <div className="ml-10 space-y-2">
                  {q.options.map((option, idx) => {
                    const value = idx + 1;
                    const isSelected = answers[q.id] === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleAnswer(q.id, value)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "border-serpin-yellow bg-serpin-yellow-soft font-medium text-ink"
                            : "border-ink/10 hover:border-ink/20 hover:bg-cream-dark/50 text-ink-light"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-serpin-yellow-hover bg-serpin-yellow"
                                : "border-ink/20"
                            }`}
                          >
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-ink" />
                            )}
                          </span>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Bell curve hint for Q1 */}
                {q.id === 1 && (
                  <div className="ml-10 mt-3 px-4 py-2.5 bg-cream-dark border-l-3 border-ink/20 rounded-r-lg">
                    <p className="text-sm text-ink-light">
                      <span className="font-semibold text-ink">
                        The sweet spot:
                      </span>{" "}
                      Too little interpretation? Code can handle it. Too much?
                      You need a human. Agents thrive in the middle.
                    </p>
                  </div>
                )}

                {/* Pre-mortem hint for Q4 */}
                {q.id === 4 && (
                  <div className="ml-10 mt-3 px-4 py-2.5 bg-cream-dark border-l-3 border-ink/20 rounded-r-lg">
                    <p className="text-sm text-ink-light">
                      <span className="font-semibold text-ink">
                        Pre-mortem tip:
                      </span>{" "}
                      Higher consequences don&apos;t disqualify agents, but
                      they do mean you&apos;ll need guardrails, monitoring,
                      and human oversight. Define your kill criteria before you build.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        {!showResults && (
          <div className="pt-4 pb-8">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                allAnswered
                  ? "bg-ink text-white hover:bg-ink-light cursor-pointer shadow-lg shadow-ink/10"
                  : "bg-cream-dark text-ink-muted cursor-not-allowed"
              }`}
            >
              {allAnswered
                ? "See your results"
                : `Answer all questions to continue (${questions.length - answeredCount} remaining)`}
            </button>
          </div>
        )}
      </section>

      {/* Results */}
      {showResults && (
        <section ref={resultsRef} className="pb-16">
          {/* Tier Result Banner */}
          <div
            className={`border-y border-ink/10 ${
              tierResult.tier === 1
                ? "bg-tier1-bg"
                : tierResult.tier === 2
                  ? "bg-tier2-bg"
                  : "bg-tier3-bg"
            }`}
          >
            <div className="max-w-3xl mx-auto px-4 py-10">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${
                    tierResult.tier === 1
                      ? "text-tier1 bg-tier1-bg border-tier1/20"
                      : tierResult.tier === 2
                        ? "text-tier2 bg-tier2-bg border-tier2/20"
                        : "text-tier3 bg-tier3-bg border-tier3/20"
                  }`}
                >
                  Tier {tierResult.tier}: {tierResult.label}
                </span>
                <span className="text-sm text-ink-muted">
                  Score: {percentage}%
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                {tierResult.headline}
              </h2>
              <p className="text-base text-ink-light leading-relaxed max-w-2xl">
                {tierResult.description}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="max-w-3xl mx-auto px-4 py-10">
            <h3 className="text-lg font-semibold text-ink mb-6">
              Your score breakdown
            </h3>
            <div className="space-y-4">
              {questions.map((q) => {
                const raw = getRawScore(answers[q.id], q.scoring);
                const barWidth = (raw / 5) * 100;
                return (
                  <div key={q.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink font-medium">
                        {q.shortLabel}
                      </span>
                      <span className="text-sm text-ink-muted">
                        {raw}/5
                      </span>
                    </div>
                    <div className="h-5 bg-cream-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          raw >= 4
                            ? "bg-tier1"
                            : raw >= 3
                              ? "bg-serpin-yellow-hover"
                              : "bg-tier3/70"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-ink-muted mt-4">
              Not all questions are weighted equally. Interpretation level,
              consequences, human validation, and leadership readiness carry
              more weight in the final score.
            </p>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="max-w-3xl mx-auto px-4 pb-10">
              {warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-ink mb-4">
                    Areas to address
                  </h3>
                  <div className="space-y-3">
                    {warnings.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-tier3-bg rounded-xl border border-tier3/10"
                      >
                        <svg
                          className="w-5 h-5 text-tier3 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-ink">
                            Q{insight.questionId}:{" "}
                            {
                              questions.find((q) => q.id === insight.questionId)
                                ?.question
                            }
                          </p>
                          <p className="text-sm text-ink-light mt-1">
                            {insight.insight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {strengths.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-ink mb-4">
                    Working in your favour
                  </h3>
                  <div className="space-y-3">
                    {strengths.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 bg-tier1-bg rounded-xl border border-tier1/10"
                      >
                        <svg
                          className="w-5 h-5 text-tier1 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-ink">
                            Q{insight.questionId}:{" "}
                            {
                              questions.find((q) => q.id === insight.questionId)
                                ?.question
                            }
                          </p>
                          <p className="text-sm text-ink-light mt-1">
                            {insight.insight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="max-w-3xl mx-auto px-4 pb-10">
            <h3 className="text-lg font-semibold text-ink mb-4">
              Recommended next steps
            </h3>
            <div className="bg-white rounded-xl border border-ink/10 p-5">
              <ol className="space-y-3">
                {nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-xs font-semibold text-ink-muted">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-ink-light leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Email CTA */}
          <div className="max-w-3xl mx-auto px-4 pb-10">
            <div className="bg-white rounded-xl border border-ink/10 p-6">
              <h3 className="text-lg font-semibold text-ink mb-2">
                Get the next four questions
              </h3>
              <p className="text-sm text-ink-light mb-5">
                This assessment covers Question 1 of five. We&apos;re building
                tools for the remaining four (process mapping, agent design,
                quality, and deployment). Leave your email and we&apos;ll send
                them as they ship.
              </p>

              {!emailSubmitted ? (
                <>
                <form
                  onSubmit={handleEmailSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 rounded-lg border border-ink/15 bg-cream text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-serpin-yellow focus:border-serpin-yellow"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-ink text-white rounded-lg font-medium text-sm hover:bg-ink-light transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Download results &amp; sign up
                  </button>
                </form>
                <p className="mt-3 text-xs text-ink-muted/70">
                  We&apos;ll email you when the next question unlocks &mdash; that&apos;s it. No spam, no selling your data. Unsubscribe any time.
                </p>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-tier1-bg rounded-lg">
                  <svg
                    className="w-5 h-5 text-tier1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-tier1 font-medium">
                    Your PDF is downloading. We&apos;ll email you when the
                    next questions are ready.
                  </p>
                </div>
              )}

              {/* Share link */}
              <div className="mt-5 pt-5 border-t border-ink/10">
                <p className="text-sm text-ink-muted mb-2">
                  Share your results with your team:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3 py-2 rounded-lg border border-ink/10 bg-cream-dark text-xs text-ink-muted font-mono truncate"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="px-3 py-2 text-xs font-medium text-ink-light border border-ink/15 rounded-lg hover:bg-cream-dark transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reset */}
          <div className="max-w-3xl mx-auto px-4 pb-10 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleReset}
              className="text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              &larr; Take the assessment again
            </button>
            {isSharedView && (
              <span className="text-xs text-ink-muted">
                This is a shared result. Take the assessment yourself to get
                personalised insights.
              </span>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-ink/10 bg-white/50">
            <div className="max-w-3xl mx-auto px-4 py-10 text-center">
              <p className="text-sm text-ink-muted mb-2">
                This assessment is Question 1 of
              </p>
              <p className="text-lg font-semibold text-ink mb-3">
                The Five Questions of Agent Discovery and Design
              </p>
              <p className="text-sm text-ink-light max-w-md mx-auto mb-5">
                A practical framework for designing AI agents that work in
                production, built from real project experience.
              </p>
              <a
                href="https://serpin.ai/agent-design"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-lg text-sm font-medium hover:bg-ink-light transition-colors"
              >
                Learn more about Agent Discovery and Design
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
