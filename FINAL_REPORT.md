# Performance Test Report — Swag Labs (saucedemo.com)

See `TEST_PLAN.md` for full methodology, scope reasoning, and the investigation
narratives summarized here. This report is the results summary the brief asks for.

## Executive summary

Five tiers were run against Swag Labs: Baseline (50 users), Load-Medium (150
users), Load-Peak (300 users), Stress (500 users), and Endurance (150 users,
10 minutes), plus a low-volume smoke check against the real saucedemo.com.
Every tier includes a 1–3s think-time timer between requests, matching the
brief's "think time timers between requests" requirement.

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

## Results by tier

Recomputed directly from the raw `.jtl` files, counting only the 5 named
transaction-controller samples (Login/Inventory/Inventory Item/Cart/Checkout),
not every embedded-resource sub-sample:

| Tier | Concurrent | Transaction attempts | Successful | Success rate | Mean (success only) | P95 (success only) | Successful throughput |
|---|---|---|---|---|---|---|---|
| Baseline | 50 | 250 | 250 | **100%** | 37ms | 79ms | 10.9 req/s |
| Load-Medium | 150 | 23,653 | 11,128 | **47.05%** | 626ms | 1,295ms | 35.7 req/s |
| Load-Peak | 300 | 39,436 | 10,729 | **27.21%** | 2,047ms | 4,393ms | 33.7 req/s |
| Stress | 500 | 59,351 | 9,029 | **15.21%** | 3,888ms | 10,214ms | 28.1 req/s |
| Endurance (10 min, 150 concurrent) | 150 | 50,565 | 21,100 | **41.73%** | 416ms | 1,159ms | 34.2 req/s |
| Smoke (real site) | 5 | 25 | 5 | 20%* | 2,140ms | — | — |

\* Smoke's low success rate is the known routing divergence (see below), not
the same phenomenon as Load/Peak/Stress. Its latency figures reflect real
internet round-trips to saucedemo.com, not the local target.

Throughput = successful transactions ÷ measured wall-clock duration (first to
last request timestamp in each tier's `.log` file, not the planned ramp+duration
config). Baseline's number isn't a real capacity figure — 50 users doing one
pass each isn't sustained traffic — but it's included for completeness. Across
every sustained tier, successful throughput sits in a **28–36 req/s band**,
regardless of concurrency level, which is itself informative: it's well under
the brief's 500 req/s target, and it doesn't rise with more concurrent users
(Load-Peak at 300 and Stress at 500 aren't faster than Load-Medium at 150) —
consistent with the generator-side bottleneck being the ceiling, not the
application's real serving capacity.

Every sustained tier — including Endurance — falls well short of the brief's
≤1% error target at 150+ concurrent. Endurance's own result varies
dramatically run to run; see "Endurance" below.

## Baseline: clean pass

0% errors, P95 79ms, well under the brief's 2s target. This is the one tier with no
caveats — 50 users, 1 iteration each, against the local target, nothing unusual.

## Connection-refused / bind-exhaustion artifact (all 4 sustained tiers)

At 150+ concurrent, a substantial share of requests still fail — not with an
application error, but with a client-side connection failure, even with
think-time pacing in place. Full diagnostic detail is in `TEST_PLAN.md` §6b.

| Tier | `HttpHostConnectException` (Connection refused) | `BindException` (client port exhaustion) | `SocketTimeoutException` |
|---|---|---|---|
| Load-Medium | 0 | **13,758** | 0 |
| Load-Peak | 0 | **34,646** | 0 |
| Stress | 3,762 | **58,899** | 28 |
| Endurance | 0 | **33,933** | 0 |

(Counted at the individual-request level, e.g. `GET /inventory.html`, not the
transaction-controller rollup — the rollup only records "1 sample failed,"
not why. A further 772–7,055 "Embedded resource download error" failures per
tier, on `favicon.ico`/static assets at HTTP 200, are a separate minor issue
and not counted in the table above.)

**`BindException` — still the dominant failure — is the same specific failure
mode as before: the test generator (this laptop) running out of free outbound
TCP ports.** Windows' ephemeral port range here is 49,152–65,535 (~16,384
ports), each held for a default TIME_WAIT of 120s after a connection closes.
Even with 1–3s of think time between requests, 150–300 threads ramping up and
opening connections for several minutes straight can still exhaust that pool —
think time slows the *rate* of new connections per thread, but doesn't change
how many threads are open at once, so at 150+ concurrent it reduces the
problem without eliminating it.

**Two supporting facts, still true on the current suite:** nginx's own
access/error logs show zero errors across all runs — every request that
reached the application was served 200, ruling out an application-side fault.
And a one-shot burst of 1,000 concurrent `curl` requests succeeded 100%,
consistent with `BindException`: a one-shot burst doesn't hold connections
open for minutes, so it never exhausts the port pool.

**From the prior 200-user tier (not re-tested on this suite):** disabling the
`Connection: close` header, on the theory that forcing a fresh connection per
request was the cause, made things worse, not better (success rate fell to
0.56%, with the failure switching to `IllegalStateException: Connection pool
shut down`). Keep-alive-off exhausts ports; keep-alive-on exhausts JMeter's own
connection pool — the generator hits a ceiling either way. That's why
`Connection: close` stays in all five `.jmx` files rather than being reverted.

**Stress tier's failure mix is now the same mechanism as the others** —
`BindException` dominant (58,899 of 62,689 failures), with a smaller
`HttpHostConnectException`/`SocketTimeoutException` minority. On an earlier
run of this suite, Stress looked mechanistically different (a more even
`HttpHostConnectException`/`BindException` split, suggesting queuing or
backpressure rather than pure port exhaustion); this run doesn't reproduce
that distinction. Taken with the Endurance variance below, that's a second
sign this whole failure family is less deterministic run-to-run than a single
pass can show.

**Conclusion:** this is a test-environment (generator-side) bottleneck, not an
application failure — nginx never saw these requests, under either
keep-alive setting. But it also means **the successful-request numbers in
this report cannot be trusted as "what the app can really do,"** because the
environment that produced them was itself failing under the same load,
non-randomly, in a way that plausibly biases which requests succeed. The
generator needs a real fix (see "What would actually verify these goals"
below) before these numbers mean anything about the application. Full
investigation trail, including the refuted hypothesis, in `TEST_PLAN.md` §6b.

## Endurance: high run-to-run variance, not a fix

Endurance has now been run twice, identical `.jmx` file both times (150
concurrent, 10 minutes, same think-time timer as every other tier):

| Run | Success rate | Failures |
|---|---|---|
| Run 1 | 99.99% | 1 of 15,377 |
| Run 2 | 41.73% | 29,465 of 50,565 |

That is not a small discrepancy — it is the same test plan, against the same
target, swinging from essentially perfect to a majority failure rate. **This
supersedes an earlier version of this report, which treated Run 1 alone as
evidence that think-time pacing had fixed the port-exhaustion problem at this
tier.** One clean run never proved that; it proved the underlying race didn't
trigger on that particular pass. The swing between the two runs is itself the
more useful finding: it says the port-exhaustion failure is **non-deterministic
and timing-sensitive**, not a fixed property of a given concurrency level —
which is consistent with, and arguably strengthens, the root-cause diagnosis
in this report. A real application defect would not swing from 0.01% to
41.73% failure between two otherwise-identical runs; a laptop's ephemeral-port
pool racing against connection churn plausibly would.

Practical consequence: Endurance cannot be reported as meeting the brief's
≤1% error-rate goal. It was observed once, not reliably reproduced — see
"Goal-by-goal verdict" below.

## Corroborating observation: same test plan, different generator OS

The CI pipeline (`.github/workflows/performance-smoke.yml`) can run any tier
on demand against a GitHub-hosted Linux runner, using the exact same `.jmx`
files as the local evidence above. Dispatching Load-Medium and Stress there
came back **0.000% errors and single-digit-millisecond P95 on both** —
dramatically cleaner than the same tiers' 52.95%/84.79% failure rates on the
Windows laptop used for this report's evidence runs. This is one CI run per
tier, not a controlled experiment, so it's reported as an observation, not a
proven cause. But it's consistent with the root-cause diagnosis above:
Windows' Docker Desktop routes container traffic through a WSL2/Hyper-V
boundary that native Linux Docker doesn't have, and Linux generally handles
ephemeral-port/TIME_WAIT reuse more permissively than Windows — both
plausible reasons a different OS would relieve the same generator-side
bottleneck. Changing only the generator's operating system, with the
application and test plan held constant, made the failure disappear — which
is itself evidence the failure was never in the application.

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
run, for reasons explained per goal below.

| Goal | Target | Verdict |
|---|---|---|
| **Response time** | < 2s for critical transactions | **Not met at 150+ concurrent.** Baseline (50 users) is 79ms P95 — a sanity check, not a load test. Every sustained tier exceeds 2s P95 (1.2–10.2s across Load-Medium/Peak/Stress/Endurance). |
| **Throughput** | 500 req/s | **Not met.** Successful-only throughput sits in a 28–36 req/s band across every sustained tier and does not rise with concurrency — see "Results by tier" above. That ceiling reflects the test generator's own ports/connections limit, not necessarily the application's real capacity; see "What would actually verify this" below. |
| **Error rate** | ≤ 1% under max load | **Not met, on any sustained tier.** Load-Medium 52.95%, Load-Peak 72.79%, Stress 84.79%, Endurance 58.27% failure. Endurance was observed at 0.01% failure on an earlier run of the identical test plan — that variance is itself discussed under "Endurance" above, not treated as a pass. Confirmed not an application fault throughout (nginx logs clean) — the failures trace to the test generator's own TCP port exhaustion. |
| **Scalability** | Evaluate behavior under increasing load | **Not conclusive.** The 50→150→300→500 progression shows error rate rising roughly with concurrency (Load-Medium → Load-Peak → Stress), but Endurance's own two runs (0.01% and 58.27%, both at 150 concurrent) show more run-to-run variance than the concurrency progression itself — so this isn't a clean read of the *application's* scalability, only of how unstable the test generator gets under sustained load. |

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
3. **Run each tier multiple times before trusting any single result.** The
   Endurance variance above (0.01% vs 58.27% failure on identical config) is
   the clearest evidence in this report that one pass isn't enough evidence
   for a timing-sensitive failure mode — a single clean run doesn't mean a
   problem is fixed, and a single bad run doesn't fully characterize it
   either. Bracketing the break point (a data point between 50 and 150
   concurrent) is still worth doing, but repeat runs matter more than a new
   concurrency level at this point.

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
- `jmeter/tier-*.jmx` — five literal per-tier test plans (baseline, load-medium,
  load-peak, stress, endurance), plus `tier-smoke-real-site.jmx`
- `jmeter/demo-live-monitoring.jmx` — separate demo file, not an evidence tier
- `reports/<tier>/index.html` — HTML dashboard per run
- `EVIDENCE_CHECKSUMS.txt` — SHA-256 of every raw `.jtl`
- `.github/workflows/performance-smoke.yml` — CI: baseline-scale run on every
  push, a weekly scheduled Load-Medium run, and an on-demand `workflow_dispatch`
  to run any tier — all gated on the brief's own SLA (P95 < 2s, error rate ≤ 1%)
  and summarized on the run's own summary page
- `app-under-test/` — vendored Swag Labs source + serving Dockerfile/nginx config
- `docker-compose.yml`, `grafana/` — live monitoring stack
- `grafana-dashboard.png` — screenshot of the working dashboard
