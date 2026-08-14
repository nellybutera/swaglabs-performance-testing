# Performance Test Report — Swag Labs (saucedemo.com)

See `TEST_PLAN.md` for full methodology, scope reasoning, and the investigation
narratives summarized here. This report is the results summary the brief asks for.

**Correction notice (2026-08-14):** an earlier version of this report claimed
the throughput and response-time goals were "Met," based on aggregate
`statistics.json` numbers that treat every JMeter sub-sample (including failed
connection attempts) as a data point. Recomputing from the raw `.jtl` files —
counting only the five named transaction-controller samples, correctly parsing
the CSV (an earlier pass here also had a bug: naive comma-splitting on a field
that itself contains commas) — shows those claims were wrong. Corrected numbers
and an honest goal-by-goal verdict are below. See `TEST_PLAN.md` §6b for the
full account of what was miscounted and why.

## Executive summary

Swag Labs (saucedemo.com) has no server-side application logic — it's a 100%
client-side single-page app (`TEST_PLAN.md` §2, verified against the app's own
source and confirmed empirically against the live production build). Consequently
this test measures the static-asset delivery/hosting layer, not backend business
transactions, and the brief's three thresholds are reinterpreted accordingly
(`TEST_PLAN.md` §7). Even accounting for that reinterpretation, **the performance
goals are not verified** — see "Goal-by-goal verdict" below. What this project
does deliver: a working JMeter test harness (5 tiers, CI-integrated, live
Grafana monitoring) and an honestly-diagnosed test-environment bottleneck, which
is a legitimate and common outcome of a first performance-test pass — just not
the same thing as a clean pass on the brief's goals.

## Results by tier — corrected

Recomputed directly from the raw `.jtl` files, counting only the 5 named
transaction-controller samples (Login/Inventory/Inventory Item/Cart/Checkout),
not every embedded-resource sub-sample:

| Tier | Concurrent | Transaction attempts | Successful | Success rate | Mean (success only) | P95 (success only) |
|---|---|---|---|---|---|---|
| Baseline | 50 | 250 | 250 | **100%** | 8ms | 18ms |
| Load | 200 | 111,411 | 11,769 | **10.56%** | 2,641ms | 5,190ms |
| Stress | 500 | 51,639 | 8,163 | **15.81%** | 9,546ms | 17,786ms |
| Endurance (10 min) | 200 | 83,704 | 19,455 | **23.24%** | 4,639ms | 8,100ms |
| Smoke (real site) | 5 | 25 | 5 | 20%* | — | — |

\* Smoke's low success rate is the known routing divergence (see below), not
the same phenomenon as Load/Stress/Endurance.

**What changed from the original table:** the 535 req/s "throughput" and the
"Baseline is the trustworthy latency reference" framing are both retracted.
The real picture: even the requests that *did* succeed under 200+ concurrent
load took 2.6–17.8 seconds on average/P95 — far over the 2s target — and the
large majority of requests didn't succeed at all.

## Baseline: clean pass

0% errors, P95 18ms, well under the brief's 2s target. This is the one tier with no
caveats — 50 users, 1 iteration each, against the local target, nothing unusual.

## Connection-refused / bind-exhaustion artifact (Load, Stress, Endurance)

At 200+ concurrent, most requests failed — not with an application error, but
with a client-side connection failure. **This finding was revised on 2026-08-14
after the failure reasons were properly broken down by exact exception type**
(an earlier pass here only sampled a handful of failure lines and generalized
from those; counting all of them tells a different, more specific story):

| Tier | `HttpHostConnectException` (Connection refused) | `BindException` (client port exhaustion) | `SocketTimeoutException` |
|---|---|---|---|
| Load | 1,226 | **97,438** | 0 |
| Stress | 29,410 | 9,902 | 1,343 |
| Endurance | 1,632 | **54,612** | 0 |

**`BindException` — the dominant failure at Load and Endurance — is a
well-understood, specific failure mode: the test generator (this laptop)
running out of free outbound TCP ports.** Windows' ephemeral port range here
is 49,152–65,535 (~16,384 ports), each held for a default TIME_WAIT of 120s
after a connection closes. 200 threads opening a fresh connection per request
for several minutes straight, especially with keep-alive disabled (see below),
can exhaust that pool well within the test window — and did: the first
`BindException` in the Load-tier run appeared at **+46 seconds**, right after
the 30-second ramp-up completed and all 200 threads hit steady state.

**Prior investigation on this repo's history, now understood more precisely:**
- **nginx's own access/error logs showed zero errors across all runs.** Every
  request that reached the application was served 200 — still true, and still
  correctly rules out an application-side failure.
- A one-shot burst of 1,000 concurrent `curl` requests succeeded 100% — also
  still true, and consistent with `BindException`: a one-shot burst doesn't
  hold 200+ connections open for minutes, so it never exhausts the port pool.
- **Hypothesis tested, and refuted:** the theory was that the earlier
  `Connection: close` fix (disabling keep-alive) was *causing* `BindException`
  by forcing a fresh TCP connection — and a fresh ephemeral port — on every
  single request. This was tested directly: the Load tier was re-run with
  `Connection: close` disabled (keep-alive re-enabled), isolated in a scratch
  copy of the test plan, not the committed evidence file. **Result: failures
  got dramatically worse, not better** — success rate dropped from 10.56% to
  **0.56%** — and the dominant failure changed to
  `java.lang.IllegalStateException: Connection pool shut down` (1,427,481 of
  1,435,639 attempts, essentially all of them). That is a *different*
  generator-side problem: JMeter's own shared HTTP connection pool being
  exhausted/torn down under 200 concurrent threads all trying to reuse pooled
  connections, not TCP port exhaustion. So: keep-alive-off causes port
  exhaustion, keep-alive-on causes connection-pool exhaustion — **the
  generator hits a resource ceiling either way**, just a different one
  depending on this setting. The original hypothesis (that `Connection:
  close` was the root cause and removing it would fix things) is wrong.

**Stress tier's failure mix looks different** (`HttpHostConnectException`
dominant, not `BindException`) — plausibly because at 500 concurrent, requests
queue and time out before enough connections accumulate in TIME_WAIT to
exhaust the pool the same way; `SocketTimeoutException` appearing only here
supports a queuing/backpressure explanation rather than pure port exhaustion.
This tier's exact mechanism is not fully resolved and is flagged as an open
item rather than asserted with the same confidence as Load/Endurance.

**Conclusion:** this is a test-environment (generator-side) bottleneck, not an
application failure — nginx never saw these requests, under either
keep-alive setting. But it also means **the successful-request numbers in
this report cannot be trusted as "what the app can really do,"** because the
environment that produced them was itself failing under the same load,
non-randomly, in a way that plausibly biases which requests succeed. The
generator needs a real fix (see "What would actually verify these goals"
below) before these numbers mean anything about the application. Full
investigation trail, including the refuted hypothesis, in `TEST_PLAN.md` §6b.

## Endurance: no leak

Container memory before and after the 10-minute endurance run: ~18-22MB either way,
no growth trend. No evidence of a memory leak in nginx serving static files over
sustained load — the expected outcome for a static file server, confirmed rather
than assumed.

## Real-site routing divergence (Smoke test)

Direct GETs to `/inventory.html`, `/inventory-item.html`, `/cart.html`, and
`/checkout-step-one.html` return **404 on the real saucedemo.com**, confirmed
independently with `curl` outside JMeter (`/` → 200, `/cart.html` → 404). The local
Docker copy returns 200 for these because its nginx config adds an SPA `try_files`
fallback the real site doesn't have server-side (the real site relies on a
GitHub-Pages-style client-side 404 redirect trick that only works in a JS-executing
browser, not in JMeter). Login (`/`) succeeded correctly on the real site. This is
exactly what the smoke test was for — catching a divergence between the local
substitute and the real target — and it caught one. Not fixed on the local copy;
see `TEST_PLAN.md` §4 for why matching this exactly wasn't worth the effort here.

## Goal-by-goal verdict

Straight answer, evaluated against the assignment's 4 stated goals: **not
verified.** Not "verified with caveats" — genuinely not achieved by this test
run, for reasons explained per goal below. This is being said plainly rather
than softened, because the report previously said "Met" on two of these and
that was wrong.

| Goal | Target | Verdict |
|---|---|---|
| **Response time** | < 2s for critical transactions | **Not met.** Baseline (50 users) is 18ms, but that's not a load test — it's a sanity check. At 200+ concurrent, even successful requests averaged 2.6–9.5s (P95 5.2–17.8s). |
| **Throughput** | 500 req/s | **Not verified.** The number reported earlier (535 req/s) counted failed connection attempts as completed requests — it was wrong, not just optimistic. A defensible successful-only throughput number was not computed for this report; see "What would actually verify this" below. |
| **Error rate** | ≤ 1% under max load | **Not met.** Real failure rate at 200+ concurrent was 77–90% of transaction attempts (worse — 99.4% — once the follow-up diagnostic below is included). Confirmed not an application fault (nginx logs clean throughout, under both connection settings tested) — but confirmed to be a real failure nonetheless, caused by the test generator (this single laptop's) resource limits under sustained high concurrency. |
| **Scalability** | Evaluate behavior under increasing load | **Partially informative, not conclusive.** The 50→200→500 progression does show behavior changing with concurrency — but because the generator becomes the bottleneck starting at 200, what's being observed past that point is substantially the test tool's scaling behavior, not the application's. |

## What would actually verify these goals

This test's real deliverable turned out to be **infrastructure and process**
(a working 5-tier JMeter harness, CI integration, live Grafana monitoring, and
a properly-diagnosed generator-side bottleneck) rather than a clean pass on the
brief's numbers. To actually verify the four goals above, in priority order:

1. **Fix the generator bottleneck first — not by toggling `Connection:
   close`, which was tried both ways and fails differently either way** (port
   exhaustion when off, connection-pool exhaustion when on). Real fixes:
   distribute load across multiple JMeter instances/machines so no single
   generator's resources are the ceiling (JMeter's own recommended approach
   for tests beyond a few hundred concurrent users — see JMeter's remote/
   distributed testing docs), and/or explicitly size JMeter's HTTP connection
   pool (`httpclient4.max_total`/`httpclient4.max_per_route` in
   `jmeter.properties`) instead of relying on defaults tuned for much lower
   concurrency. This is the highest-leverage fix: everything else here is
   currently measuring this bottleneck, not the app.
2. **Re-run Load/Stress/Endurance** with that fix, and only then compute
   successful-only throughput/latency numbers as this app's real answer to
   the brief's goals.
3. **Bracket the actual break point** — the original test plan flagged this as
   an open item (100/150 concurrent, between Baseline's clean pass and Load's
   failure) and it's now more clearly needed: right now there's no data point
   between "50 users, perfect" and "200 users, 90% failing at the generator,"
   so the real curve — and the real answer to the Scalability goal — is
   unknown.

## Live monitoring (Grafana + InfluxDB)

Beyond the static HTML dashboards, a `docker compose up -d` Grafana + InfluxDB
stack is included for real-time observation of any run (`TEST_PLAN.md` §6a). It
is not how the numbers in this report were produced — kept as a separate concern
for a clean evidence chain — but demonstrates the same JMeter plans feeding a
live metrics pipeline via a Backend Listener. Grafana was chosen over Allure
(this author's usual reporting tool on functional-test repos) because this data
is continuous time-series metrics, not per-test pass/fail — see `TEST_PLAN.md`
§6a for the reasoning, including two real bugs hit and fixed while wiring it up.

![Grafana dashboard, live data from a short demo run](grafana-dashboard.png)

## Deliverable file map

- `TEST_PLAN.md` — full methodology, investigation narratives, decisions
- `jmeter/tier-*.jmx` — five literal per-tier test plans
- `jmeter/demo-live-monitoring.jmx` — separate demo file, not an evidence tier
- `reports/<tier>/index.html` — HTML dashboard per run
- `EVIDENCE_CHECKSUMS.txt` — SHA-256 of every raw `.jtl`
- `.github/workflows/performance-smoke.yml` — CI (smoke-scale only, by design)
- `app-under-test/` — vendored Swag Labs source + serving Dockerfile/nginx config
- `docker-compose.yml`, `grafana/` — live monitoring stack
- `grafana-dashboard.png` — screenshot of the working dashboard
