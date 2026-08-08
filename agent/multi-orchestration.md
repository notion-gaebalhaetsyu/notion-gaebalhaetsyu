# Web App Evaluation - Multi-Agent System

| # | Agent | Weight | Focus |
|---|-------|--------|-------|
| A1 | Functional Correctness | 20% | Requirements, E2E behavior, edge cases, error handling |
| A2 | Code Quality & Architecture | 16% | Module boundaries, cohesion/coupling, type safety, complexity |
| A3 | Security & Secrets | 14% | AuthN/AuthZ, input validation, OWASP, secrets (veto power) |
| A4 | Performance & Efficiency | 12% | Core Web Vitals, bundle, query efficiency, caching |
| A5 | UX & Accessibility | 12% | State design, responsiveness, WCAG 2.2 AA |
| A6 | Testing & Reliability | 10% | Test pyramid, meaningfulness, CI, observability |
| A7 | API & Data Layer | 8% | Contract consistency, schema/migrations, state management |
| A8 | DevOps & Documentation | 5% | Reproducible builds, CI/CD, README |
| A9 | Innovation & Originality | 3% | Novelty of approach, justification of tech choices |
| | Total | 100% | |

**Evaluation Output Schema for Each Agent:**
Each agent must output the following fields:
- `score`: Score out of 100 (e.g. "XX / 100") based on weight
- `eng`: English summary (one sentence)
- `kor`: Korean summary (one sentence)
- `feedback`: A short tip for improvement (starts with "💡 Tip: ")
- `recommendation`: A recommended action item based on the evaluation result (starts with "📌 Recommendation: ")

Execution order: A8 (env setup) -> A1-A7 (parallel) -> A9 (context-aware, last) -> Aggregator