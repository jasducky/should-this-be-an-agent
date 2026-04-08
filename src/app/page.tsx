import Image from "next/image";
import Link from "next/link";
import EmailCaptureForm from "./EmailCaptureForm";

const questions = [
  {
    number: 1,
    title: "Should this be an agent?",
    description:
      "Not every process needs AI. Score your use case across 9 dimensions to find out whether an agent is the right tool, or whether automation, workflow tools, or humans are a better fit.",
    ref: "From \u00a77 AI Fit",
    status: "live" as const,
    href: "/q1",
  },
  {
    number: 2,
    title: "What\u2019s the real process?",
    description:
      "Map the process your agent will handle. Identify which parts suit AI, which suit code, and which need a person. The decomposition that turns a vague idea into something you can actually scope.",
    ref: "From \u00a78\u201312 Process Decomposition",
    status: "coming" as const,
    unlockDate: "17 Apr",
  },
  {
    number: 3,
    title: "How should the agent work?",
    description:
      "The key design decisions: how the agent reasons, what tools it uses, when it hands off to a human, and how much autonomy it gets. A guided walkthrough of the choices that matter most.",
    ref: "From \u00a713\u201319 Agent Design Decisions",
    status: "locked" as const,
  },
  {
    number: 4,
    title: "How will you know it\u2019s working?",
    description:
      "Define what to measure, how to measure it, and what \u2018good enough\u2019 looks like. The quality thinking that stops you shipping something you can\u2019t monitor.",
    ref: "From \u00a720\u201324 Quality and Evaluation",
    status: "locked" as const,
  },
  {
    number: 5,
    title: "How will you keep it working?",
    description:
      "Plan for what happens after launch: monitoring, drift, operations, and the team decisions that determine whether your agent lasts.",
    ref: "From \u00a725\u201331 Deployment and Operations",
    status: "locked" as const,
  },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white/50 sticky top-0 z-50">
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
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-4">
          The ADD Framework
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-ink leading-tight">
          The five questions of agent discovery and design
        </h1>
        <p className="mt-5 text-lg text-ink-light leading-relaxed max-w-2xl">
          Most agent projects fail not because the AI isn&apos;t good enough,
          but because no one asked the right questions first. These five
          assessments help you figure out where to focus, what to address,
          and whether you&apos;re ready to build.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5 border border-ink/10 rounded-full px-3 py-1.5">
            <svg
              className="w-3.5 h-3.5"
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
            2 minutes each
          </span>
          <span className="flex items-center gap-1.5 border border-ink/10 rounded-full px-3 py-1.5">
            <svg
              className="w-3.5 h-3.5"
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
            Free assessments
          </span>
          <span className="flex items-center gap-1.5 border border-ink/10 rounded-full px-3 py-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            PDF results
          </span>
          <span className="flex items-center gap-1.5 border border-ink/10 rounded-full px-3 py-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            New question each week
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream-dark">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-4">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-2">
            Five questions. Five weeks. A clear starting point.
          </h2>
          <p className="text-base text-ink-light leading-relaxed mb-10 max-w-xl">
            Each question is a self-contained assessment that gives you
            actionable results. Work through them in order, and by the end
            you&apos;ll know where your use case stands and what to tackle
            first.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                n: "1",
                title: "Take the assessment",
                desc: "Answer 9 focused questions about your use case. Takes 2 minutes.",
              },
              {
                n: "2",
                title: "Get your results",
                desc: "Instant scoring with warnings, strengths, and concrete next steps.",
              },
              {
                n: "3",
                title: "Download your PDF",
                desc: "Share the results with your team and leadership.",
              },
            ].map((step) => (
              <div key={step.n} className="flex sm:flex-col gap-4 sm:gap-0 sm:text-center">
                <div className="w-9 h-9 rounded-full bg-serpin-yellow flex items-center justify-center text-sm font-semibold text-ink shrink-0 sm:mx-auto sm:mb-3">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-[15px] mb-1">{step.title}</p>
                  <p className="text-sm text-ink-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Five Questions */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-4">
          The five questions
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-8">
          Work through them in order
        </h2>

        <div className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <div
              key={q.number}
              className={`relative border rounded-xl p-6 sm:p-7 overflow-hidden transition-all ${
                q.status === "live"
                  ? "border-serpin-yellow hover:border-ink hover:shadow-sm"
                  : "border-ink/10 opacity-60"
              }`}
            >
              {/* Accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  i % 2 === 0 ? "bg-serpin-yellow" : "bg-ink"
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
                    Question {q.number}
                  </p>
                  <h3
                    className={`text-lg sm:text-xl font-semibold ${
                      q.status === "live" ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {q.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {q.status === "live" && (
                    <span className="text-[11px] font-semibold tracking-wide uppercase bg-serpin-yellow text-ink px-3 py-1 rounded-full">
                      Live
                    </span>
                  )}
                  {q.status === "coming" && (
                    <>
                      <svg
                        className="w-4 h-4 text-ink-muted/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-[11px] font-semibold tracking-wide uppercase border border-ink/15 text-ink-muted px-3 py-1 rounded-full">
                        Unlocks {q.unlockDate}
                      </span>
                    </>
                  )}
                  {q.status === "locked" && (
                    <>
                      <svg
                        className="w-4 h-4 text-ink-muted/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-[11px] font-semibold tracking-wide uppercase bg-cream-dark text-ink-muted px-3 py-1 rounded-full">
                        Coming soon
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p
                className={`text-[15px] leading-relaxed mt-2 ${
                  q.status === "live" ? "text-ink-light" : "text-ink-muted/70"
                }`}
              >
                {q.description}
              </p>
              <p className="text-xs text-ink-muted/50 mt-3">{q.ref}</p>

              {q.status === "live" && q.href && (
                <Link
                  href={q.href}
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-serpin-yellow text-ink rounded-md text-sm font-semibold uppercase tracking-wide hover:bg-serpin-yellow-hover transition-colors"
                >
                  Take the assessment
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Email capture */}
      <section className="bg-ink">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
            Don&apos;t miss the next question
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            Get notified when each question unlocks
          </h2>
          <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg">
            We&apos;ll email you when the next assessment goes live. You&apos;ll
            also get a summary of all five results when the series is complete.
          </p>
          <EmailCaptureForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-6 text-center">
        <p className="text-xs text-ink-muted">
          &copy; {new Date().getFullYear()} Serpin &middot;{" "}
          <a
            href="https://serpin.ai"
            className="hover:text-ink transition-colors"
          >
            serpin.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
