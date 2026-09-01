# Performance Test Plan — Swag Labs (saucedemo.com)

**Assignment:** [Performance Testing with JMeter](https://github.com/AmaliTech-Training-Academy/Quality-Assurance-Labs/blob/master/Performance%20Testing/Performance%20Testing%20with%20JMeter.md)
**Author:** Nelly Butera (`nellybutera`)
**Status:** Complete, with an honest caveat — all five tiers run and reported,
but the reported goal verdicts are "not verified" against the brief's targets,
not "met." See §6b and `FINAL_REPORT.md`'s goal-by-goal verdict.

---

## 1. Objective

Per the brief: assess the performance, scalability, and reliability of Swag Labs
(saucedemo.com) under varying load, covering login, product search, product details,
cart, and checkout, against:

| Metric | Target |
|---|---|
| Response time | < 2s for all critical transactions |
| Throughput | 500 requests/second |
| Error rate | ≤ 1% of requests under maximum load |

Section 2 below documents an investigation finding that changes how these targets are
interpreted for this specific AUT. Read it before the numbers in §7 — without it the
tier results look like a test of application logic; they are not.

---

## 2. Scope — investigation finding (read first)

**Finding: Swag Labs has no server-side application logic to load-test. It is a
100%-client-side single-page app.** Everything a JMeter HTTP sampler can distinguish —
login, search, cart, checkout — resolves to the same static document and the same JS
bundle. This was verified by inspecting the app's own source
(`saucelabs/sample-app-web`, the repo that builds and deploys saucedemo.com), not
assumed:

- **Login is a client-side array lookup**, not a network call:
  `src/utils/Credentials.js::verifyCredentials()` checks the submitted password against
  a hardcoded `VALID_PASSWORD` constant and the username against a hardcoded
  `VALID_USERNAMES` array (both in `src/utils/Constants.js`), then sets a cookie
  client-side. No `fetch`/`XMLHttpRequest`/`axios` call exists anywhere in this path.
- **Routing is client-side.** `src/index.jsx` uses React Router's `BrowserRouter` for
  `/`, `/inventory.html`, `/cart.html`, `/checkout-step-one.html`, etc. Navigating
  between these in a real browser does **not** issue a new HTTP request — the router
  swaps rendered components in-place.
- **Product/cart data is bundled, not fetched.** `Inventory` renders from
  `src/utils/InventoryData.js`, a static JS module imported at build time. There is no
  `api/`, `services/`, or equivalent folder anywhere in `src/`, and `package.json` has
  no HTTP client dependency beyond what's used for framework/tooling internals.
- **The production build confirms it.** `npm run build` (Vite) emits exactly one HTML
  document, `build/index.html` — no `inventory.html`, `cart.html`, or
  `checkout-*.html` files exist on disk. A direct GET to any of those paths 404s
  unless the server rewrites it to `index.html` (an SPA fallback — see §4).
  `index.html` itself references exactly **six** resources: the JS bundle
  (`index-XyuNVFOR.js`, 527KB / 170KB gzip), one CSS file (28KB / 10KB gzip),
  `favicon.ico`, one apple-touch icon, `manifest.json`, and one third-party Google
  Fonts stylesheet. That's the entire page weight a non-JS HTTP client will ever see.
- **The remaining ~2MB of the build** (eight product photos, a 1.4MB PDF-rendering
  chunk for order receipts) is never referenced by `index.html` and is only fetched
  when React actually renders and executes — i.e. only by a real browser, never by
  JMeter, regardless of which route a sampler targets.

**What this means for the deliverable:** the five named flows in the brief
(login/search/details/cart/checkout) cannot be distinguished as five different
backend transactions, because there is only one. This test plan keeps five named
samplers anyway — mapped one-to-one to the app's five routes — because that's what
the brief and grading rubric ask for, but documents honestly that they all return the
byte-identical document and bundle. The metric this test actually measures is **the
delivery/hosting layer's capacity to serve that one static payload under concurrency**
— a legitimate and separately useful thing to measure, just not the thing the brief's
prose describes. Threshold reinterpretation is in §7.

---

## 3. Application Under Test

- **Source:** [`saucelabs/sample-app-web`](https://github.com/saucelabs/sample-app-web)
  (the actual source for saucedemo.com), vendored into `app-under-test/` in this repo
  at the commit checked out on 2026-08-11.
- **Routes exercised:** `/` (login), `/inventory.html` (product search/listing),
  `/inventory-item.html` (product details), `/cart.html`, `/checkout-step-one.html`.
- **Valid test credentials** (from `Constants.js`, client-side only — not secrets):
  username `standard_user`, password `secret_sauce`.

---

## 4. Target environment & authorization

**Real saucedemo.com is Sauce Labs' own production infrastructure — not something
this project owns or has been authorized to load-test.** The brief's assignment
context does not constitute authorization from the site owner, and running 500+
concurrent threads against a third party's live site risks CDN rate-limiting/blocking
and would in any case measure the network path and Sauce Labs' CDN, not this project's
work.

**Decision:** all four tiers (baseline/load/stress/endurance) run against a **local
Docker copy** of the same source, built and served under our own control (§5). A
single **smoke-level** run (5 threads, 1 iteration each) against the real
`saucedemo.com` is included, solely to confirm the `.jmx` correctly targets real
routes and returns the same shape of response the local copy does — not as a load
test of the real site.

**The smoke test did its job: it caught a real divergence.** `/inventory.html`,
`/inventory-item.html`, `/cart.html`, and `/checkout-step-one.html` return **404** on
the real `saucedemo.com` for a direct GET, confirmed independently with `curl`
outside JMeter entirely (`/` → 200, `/cart.html` → 404). The local Docker copy
returns 200 for all of these because its nginx config uses a `try_files` SPA
fallback (§5); the real site does not do this server-side — its `index.html`
contains the well-known ["SPA for GitHub Pages"](https://github.com/rafgraph/spa-github-pages)
script, and the build output includes a GitHub-Pages-style `404.html`, meaning deep
links only resolve correctly in a real browser that executes JS and follows that
client-side redirect. JMeter, having no JS engine, sees the raw 404 and stops there.
This does not change §2's conclusion (still no server-side business logic either
way) — it's a hosting-layer difference between the local substitute and the real
site, not a contradiction of the earlier finding. Not "fixed" on the local copy:
matching the real site's exact GitHub-Pages 404 behavior would cost more effort than
it's worth for what this smoke test is for (route-correctness sanity, not fidelity).

This mirrors a lesson already learned on a prior project (Entra load testing,
2026-08): a load generator run against infrastructure you don't control, or without
sign-off/an announced window, contaminates results and carries blast-radius risk.
Same principle, applied here proactively.

---

## 5. Server identity & configuration

Serving layer is pinned and documented because throughput ceilings are highly
sensitive to which server serves the build — an unnamed server makes every number in
this report unfalsifiable.

- **Build stage:** `node:24.9.0-alpine` (pinned to the repo's own `.nvmrc`), `npm ci`
  + `npm run build` (Vite, `outDir: build`).
- **Serve stage:** `nginx:1.27-alpine`, serving `build/` as static files.
  - `try_files $uri $uri/ /index.html;` — SPA fallback, required because
    `/cart.html` etc. are not real files (§2).
  - `gzip on` for text/js/css/svg, `gzip_min_length 256` — matches how a real static
    deployment would be configured.
  - `worker_connections` raised from nginx's default of 1024 to 4096, so nginx's own
    default isn't an unexamined ceiling at the 500-concurrent stress tier.
- Defined in `app-under-test/Dockerfile.perf`, `nginx.perf.conf`,
  `nginx.perf.main.conf` — **not** the repo's own `Dockerfile` (that one installs
  Sauce Connect for cloud e2e test runs; it never serves the built app).

## 6. JMeter configuration decisions

Held identical across all five files so results are comparable to each other:

- **HTTP Cache Manager: disabled.** Every virtual user's every iteration is treated
  as a first-time visitor with a cold cache — the conservative/worst-case assumption,
  and consistent with modeling distinct concurrent users rather than one user
  reloading repeatedly.
- **Retrieve All Embedded Resources: enabled**, parallel downloads = 6 (typical
  browser default), **restricted to the target host** via URL-pattern exclusion —
  the Google Fonts stylesheet referenced in `index.html` points at
  `fonts.googleapis.com`, a third party we have no reason to load-test and no
  business sending concurrent synthetic traffic to.
- **Named samplers**, one Transaction Controller per simulated user session:
  Login → Inventory → Inventory Item → Cart → Checkout Step One. Each hits a distinct
  route; each is documented (§2) to return the same underlying document.
- Response assertion: HTTP 200 on the primary document request of each sampler.
  Verified this is a real check, not decorative: stopping the target container and
  re-running produced `success=false` rows with the expected assertion failure
  message, not silent passes.
- **`Connection: close` header manager, applied globally.** Added after an
  investigation described below; kept on all five files for consistency even though
  it did not resolve what it was meant to fix.

### Design decision: one literal file per tier, not one parametrized file

The `.jmx` originally used a single canonical plan with `${__P(...)}` command-line
properties (`-Jthreads`, `-Jduration`, etc.) to switch between tiers. This caused two
separate unbounded-run incidents before any real tier run completed:

1. `LoopController.continue_forever` hardcoded `true` (JMeter's "Infinite" loop
   checkbox) overrides the `loops` property regardless of its value — a "5 threads,
   1 loop" dry run ran for **~3 hours** against the local container before being
   caught by manual file-size inspection and killed.
2. `ThreadGroup.scheduler`, parametrized as `${__P(scheduler,false)}`, is a
   `boolProp` — unlike `stringProp`, JMeter's `BooleanProperty` does **not** evaluate
   `${__P(...)}` function syntax. It parses the raw literal string, so the value was
   silently always `false` regardless of `-Jscheduler=true`, meaning `duration` was
   never enforced. A "200 threads, 5 min" load-tier run consequently ran unbounded
   for **35+ minutes**.

Both were caught the same way both times: a result file growing past its expected
wall-clock window, found by manual inspection, not by any automated check. In
response: (a) `jmeter/SwagLabsLoadTest.jmx` (the parametrized master) was deleted and
replaced with five literal files — `tier-baseline.jmx`, `tier-load.jmx`,
`tier-stress.jmx`, `tier-endurance.jmx`, `tier-smoke-real-site.jmx` — each with
hardcoded thread/ramp/duration/loop values and no `__P` anywhere (generated via a
small Node script from a shared template so the five stay structurally identical
except for those literal values); and (b) every real run is now wrapped in the OS
level `timeout` command as a hard backstop independent of JMeter's own config, e.g.
`timeout -k 10 470 jmeter -n -t jmeter/tier-load.jmx ...`.

### Investigation: connection-refused errors at 200+ concurrent (load tier)

The first Load-tier run (200 concurrent) recorded a per-transaction error rate of
**~91%** — `Non HTTP response code: HttpHostConnectException / Connection refused`.
Taken at face value this would fail the brief's ≤1% target badly. It was not treated
at face value; it was investigated:

- **nginx's own access/error logs showed zero errors for the entire run.** Every
  request nginx received was served 200. The refusals never reached the application.
- **A one-shot burst of 1,000 concurrent `curl` requests against the same target
  succeeded 100%** — so it is not a simple raw-concurrency ceiling on the Docker
  Desktop host↔container port-forwarding layer.
- **Failures were periodic, not load-proportional**: clustered in bursts roughly
  every 90 seconds, with clean gaps in between, rather than a steady error rate
  proportional to concurrent load.

Hypothesis: nginx's `keepalive_timeout 65` was causing synchronized idle-connection
closure across ~200 threads ramped up within a tight 30s window, followed by a
synchronized reconnect burst that something below the application (Docker Desktop's
Windows port-forwarding layer, or JMeter's own connection pool) failed to absorb.

**Fix attempted:** added a global `Connection: close` header to disable HTTP
keep-alive, removing the synchronized-idle-close mechanism from the equation.
**Result: did not resolve it.** The re-run showed materially the same error rate
(~89%) and slightly worse latency (mean 510ms vs 405ms, P95 2854ms vs 2648ms) — the
hypothesis was wrong, or at least incomplete. Per the evidence already in hand
(nginx clean, curl clean, periodic-not-proportional pattern), this is being reported
as an **unresolved measurement-layer artifact, not an application finding**, rather
than invested in further — the app-side evidence (zero nginx errors) is strong enough
on its own to draw that conclusion without fully diagnosing which layer between
JMeter and nginx is responsible. Both numbers are kept in `FINAL_REPORT.md` with this
explanation; the `Connection: close` header stayed in all five files afterward for
cross-tier consistency even though it did not fix the issue.

**Confirmed at the stress tier too, though not with a simple concurrency-scaling
relationship.** At 500 concurrent the same artifact reproduced — nginx's own logs
again showed **zero** errors for the entire run — but the aggregate error rate was
53.97% versus Load's 62.86% (Total row, both tiers), i.e. slightly *lower* at higher
concurrency, while latency was much worse (P95 13.5s vs 4.5s). That combination — 
error rate not simply increasing with concurrency, while latency clearly does — is
itself informative: it's more consistent with a queuing/plumbing artifact (requests
increasingly delayed rather than increasingly refused as concurrency rises) than
with a clean capacity ceiling in the application. It was not investigated further
than this per the same reasoning as the load tier: the app-side evidence (zero
nginx errors at two different concurrency levels) is sufficient to call this a
test-environment ceiling rather than an application finding, and fully diagnosing
which layer is responsible was judged not worth the time against this assignment's
actual deliverables.

## 6a. Live monitoring stack (Grafana + InfluxDB)

`docker-compose.yml` adds a Grafana + InfluxDB stack alongside the load-test target,
for real-time observation of a run rather than only post-hoc HTML dashboards.
**This is a separate concern from the five evidence tiers above** — none of the
committed results in `FINAL_REPORT.md` / `EVIDENCE_CHECKSUMS.txt` were produced
through this stack; they came from plain `jmeter -n -t ... -e -o` runs against the
target container alone. Re-running an evidence tier through the Backend Listener
would not invalidate the numbers, but it's kept separate for a clean chain of
custody between "what happened" and "what's evidence of what happened."

**Why Grafana and not Allure, for this project specifically:** a survey of this
author's other repos (`api-testing`, `xyz-bank-automation`) shows an established,
consistent Allure convention — but exclusively for *functional* test suites
(RestAssured+JUnit5, Selenium+TestNG), reporting pass/fail per test case with
Epic/Feature/Story/Severity annotations. That model doesn't fit a performance test:
there's no per-test pass/fail here, only continuous time-series metrics (latency,
throughput, error rate, active threads) across a run's duration. Grafana +
InfluxDB, via JMeter's own `InfluxdbBackendListenerClient` Backend Listener, is the
standard pairing for that shape of data and was chosen for fitness to the problem,
not unfamiliarity with Allure.

**Setup:**
- `jmeter/tier-*.jmx` each carry a `BackendListener` writing to
  `http://localhost:8086/write?db=jmeter` (InfluxDB 1.x line protocol via the
  built-in HTTP sender), alongside the existing `ResultCollector` — added via the
  same Node-script-patching approach as the earlier `Connection: close` header
  (§6), not hand-edited XML.
- `grafana/dashboards/jmeter-dashboard.json` — 6 panels (overall response time,
  throughput, per-transaction P95, error count, active threads, network bytes),
  auto-provisioned via `grafana/provisioning/`.
- **A real bug was hit and fixed here too**, consistent with this project's
  practice of validating every JMeter config change with a bounded run rather than
  trusting it once it parses: the Backend Listener's required
  `influxdbMetricsSender` parameter was initially omitted, causing a silent
  `NullPointerException` inside `Class.forName(null)` on test start (found by
  reading the listener's own compiled bytecode via `javap`, since the shipped
  Javadoc doesn't document this parameter as required). Fixed by adding it with the
  correct value (`org.apache.jmeter.visualizers.backend.influxdb.HttpMetricsSender`)
  and re-validating with a 30s bounded run before trusting it.
- **A second real bug was hit and fixed**: the dashboard JSON originally referenced
  the datasource as `${DS_INFLUXDB-JMETER}` — Grafana's dashboard-*export* template
  variable syntax, which only resolves during the import wizard and is meaningless
  in a directly-provisioned dashboard. Every panel silently showed "No data" as a
  result. Fixed by pinning a stable `uid: influxdb-jmeter` on the datasource in
  `grafana/provisioning/datasources/influxdb.yml` and referencing that UID directly
  in every panel/target `datasource` field. Caught by actually opening the
  dashboard and looking at it (a real headless-browser screenshot showed the "No
  data" state), not by assuming a well-formed JSON file worked.
- `grafana-dashboard.png` — a screenshot confirming the fix, taken from a short
  **demo** run (`jmeter/demo-live-monitoring.jmx`, deliberately not one of the five
  named tier files, so there's no ambiguity about which run produced it) against
  the same local target.

**Usage:** `docker compose up -d`, then any `jmeter -n -t jmeter/tier-*.jmx ...`
run will stream live metrics to `http://localhost:3000` (dashboard
auto-provisioned, anonymous viewer access enabled for convenience in this
local-only training-assignment context — not a pattern to carry into anything
with real access-control requirements).

## 6b. Corrected diagnosis of the connection-refused artifact (2026-08-14)

**Supersedes §6's conclusions; §6 is left as-is below for the original
investigation trail.**

**What was wrong in §6:** the original investigation sampled a handful of
failure lines with `head -5` / eyeballing and generalized from those to "the
connection-refused artifact." Recomputing across *all* failures, correctly —
using a real CSV parser instead of naive `awk -F','` (the `.jtl`'s
`responseMessage` field is quoted and contains embedded commas, which breaks
naive comma-splitting on a large fraction of rows) — shows the picture was
both worse and more specific than reported:

| Tier | `HttpHostConnectException` | `BindException` | `SocketTimeoutException` | Success rate |
|---|---|---|---|---|
| Load | 1,226 | **97,438** | 0 | 10.56% |
| Stress | 29,410 | 9,902 | 1,343 | 15.81% |
| Endurance | 1,632 | **54,612** | 0 | 23.24% |

`BindException` — client-side ephemeral port exhaustion — dominates at Load
and Endurance, not `HttpHostConnectException` as originally emphasized. This
also means the throughput figures reported in the original `FINAL_REPORT.md`
(535 req/s etc.) were wrong, not just optimistically framed: they came from
`statistics.json`'s aggregate `throughput` field, which counts every sampler
sub-sample (including embedded-resource requests that never left the client
due to `BindException`) as if it were a completed request.

**Hypothesis formed and tested:** given `BindException` is consistent with
"a fresh TCP connection — and fresh ephemeral port — on every request," and
this repo's own `Connection: close` header (added in §6, to fix a *different*
problem) forces exactly that, the hypothesis was: **removing `Connection:
close` should reduce `BindException` failures.**

**Test method:** copied `tier-load.jmx` to a scratch file
(not the committed evidence file), disabled the `Connection: close` Header
Manager element, ran it standalone (5 min, same 200-concurrent/30s-ramp shape
as the real Load tier), analyzed the result, then deleted the scratch file and
its output. The evidence tier files were never touched by this test.

**Result: hypothesis refuted.** Failures got dramatically worse, not better —
success rate dropped from 10.56% to **0.56%** — and the dominant failure
changed entirely, to `java.lang.IllegalStateException: Connection pool shut
down` (1,427,481 of 1,435,639 transaction attempts). This is JMeter's own
shared `HttpClient` connection pool being exhausted under 200 concurrent
threads competing to reuse pooled connections — a different generator-side
resource ceiling, not TCP ports. **Toggling keep-alive changes which
generator-side resource gets exhausted; it doesn't fix the underlying
problem, which is that a single JMeter instance on one laptop cannot sustain
200+ concurrent HTTP connections to this target for multiple minutes without
hitting some internal limit.**

**Consequence for the `Connection: close` header still present in all 5
evidence `.jmx` files:** left in place, deliberately, rather than removed
based on this finding. Removing it would only trade one generator-side
failure mode for a different, empirically worse one (0.56% vs 10.56% success)
— not a fix. The header stays as an artifact of the original (also-flawed)
investigation in §6, documented honestly rather than either defended or
silently reverted. **Actually fixing this requires distributing load across
multiple JMeter instances/machines and/or explicitly tuning JMeter's HTTP
connection pool size** (`httpclient4.max_total`, `httpclient4.max_per_route`
in `jmeter.properties`) — not a config toggle. Not done in this pass;
recorded below as the top-priority open item, superseding the "bracket
100/150" item as the more urgent next step.

**What this means for the results in §8/`FINAL_REPORT.md`:** the Load,
Stress, and Endurance numbers reflect this generator-side bottleneck, not a
clean measurement of the application's real capacity. They should be read as
"what happened when a single-laptop JMeter setup pushed 200-500 concurrent
connections at this target," not as "what this application can handle" —
`FINAL_REPORT.md`'s goal-by-goal verdict reflects this distinction.

## 7. Threshold reinterpretation

| Brief's metric | Literal meaning (assumes backend logic) | This AUT's actual meaning |
|---|---|---|
| Response time < 2s | Business-transaction latency (e.g. checkout processing) | Time-to-last-byte for the static document + its 6 embedded resources |
| Throughput 500 req/s | Backend request-handling capacity | Static-asset delivery capacity of the nginx container — expected to clear 500 req/s easily; watch for the generator (JMeter/laptop) becoming the bottleneck before the target does (rising latency with target CPU/memory flat is the tell) |
| Error rate ≤ 1% | Application errors (5xx, failed transactions) | Connection failures / timeouts / non-200s from nginx under concurrency |

## 8. Test tiers

Each row is its own literal `.jmx` file (`jmeter/tier-<name>.jmx`) — see §6 for why
there are five files instead of one parametrized file. Every real run is wrapped in
`timeout -k 10 <duration+ramp+120s>` as a hard OS-level backstop.

Load is split into two literal tiers, `tier-load-medium.jmx` (150 users) and
`tier-load-peak.jmx` (300 users), matching the brief's "150 users, then 300
users" wording directly. Every tier file includes a 1–3s Uniform Random Timer
("think time") between requests, per the brief's "think time timers between
requests" requirement. See `FINAL_REPORT.md` for the resulting numbers.

| Tier | File | Concurrent users | Ramp-up | Duration | Notes |
|---|---|---|---|---|---|
| Baseline | `tier-baseline.jmx` | 50 | 10s | 1 iteration/user (120s safety-net ceiling) | Sanity check |
| Load-Medium | `tier-load-medium.jmx` | 150 | 30s | 5 min steady-state | Brief's "150 users" literally; see §6/§6b connection-refused investigation |
| Load-Peak | `tier-load-peak.jmx` | 300 | 45s | 5 min steady-state | Brief's "then 300 users" literally |
| Stress | `tier-stress.jmx` | 500 | 60s | 5 min steady-state | Brief's "500+"; watch for generator saturation (§7) |
| Endurance | `tier-endurance.jmx` | 150 (load-medium concurrency) | 60s | **10 min** steady-state | Reduced from an originally planned 30 min — a memory/fd leak in nginx serving static files is the least likely finding in this plan, and two runaway incidents (§6) already spent the time budget the extra 20 min would have bought. Now the tier with the best error rate outside Baseline — see `FINAL_REPORT.md` |
| Smoke (real site) | `tier-smoke-real-site.jmx` | 5 | 1s | 1 iteration/user (60s safety-net ceiling) | Against real saucedemo.com only — see §4 |

## 9. Risk / sign-off

This is a training assignment against infrastructure fully owned by this project
(local Docker) except the single smoke run in §4, which is deliberately kept at
negligible scale. No external sign-off process applies; documenting the decision here
in place of one, per the same convention used on the Entra project.

## 10. Deliverable file map

- `TEST_PLAN.md` — this file
- `app-under-test/` — vendored Swag Labs source + `Dockerfile.perf` /
  `nginx.perf.conf` / `nginx.perf.main.conf`
- `jmeter/tier-*.jmx` — five literal evidence-tier test plans (§6, §8)
- `jmeter/demo-live-monitoring.jmx` — separate demo file for the Grafana
  screenshot, not an evidence tier (§6a)
- `reports/<tier>/` — HTML dashboard per run
- `EVIDENCE_CHECKSUMS.txt` — SHA-256 of raw `.jtl` result files
- `FINAL_REPORT.md` — summary across all tiers
- `.github/workflows/` — CI (smoke-level only; see that file for why). On push to
  `main`, also publishes `reports/` plus a fresh CI-run baseline report to
  GitHub Pages, via `pages/index.html` (landing page, no Allure — see README.md)
- `docker-compose.yml`, `grafana/` — live monitoring stack (§6a), separate from
  the evidence tiers
- `grafana-dashboard.png` — screenshot proving the monitoring stack works

## 11. Change log

| Date | Change |
|---|---|
| 2026-08-11 | Initial plan: scope finding, environment/authorization decision, server config, JMeter decisions, tiers |
| 2026-08-12 | Replaced the single parametrized `.jmx` with five literal per-tier files after two separate unbounded-run incidents (§6) |
| 2026-08-12 | Reduced endurance tier from 30 min to 10 min (§8) |
| 2026-08-13 | Investigated and documented the load-tier connection-refused finding; `Connection: close` fix attempted and did not resolve it (§6) |
| 2026-08-13/14 | Added Grafana + InfluxDB live-monitoring stack (§6a); fixed two real bugs along the way (missing Backend Listener parameter causing a silent NPE; a dashboard-export-only template variable causing every panel to show "No data") — both caught by validating rather than assuming, per this project's established practice |
| 2026-08-14 | Corrected the connection-refused diagnosis after finding a CSV-parsing bug in the original analysis (§6b): the real dominant failure was `BindException` (client port exhaustion), not primarily `HttpHostConnectException`. Tested and refuted the resulting "remove `Connection: close`" hypothesis directly — it makes failures worse (0.56% success vs 10.56%), via a different generator-side exhaustion mode. Retracted the "Met" verdicts on Response Time and Throughput in `FINAL_REPORT.md` — both were computed from an aggregate stat that double-counted failed sub-samples as successes |

## 12. Open items (highest priority first)

1. **Fix the generator-side bottleneck** (§6b) — a single JMeter instance on
   one laptop cannot sustain 200+ concurrent connections to this target for
   multiple minutes without exhausting either its ephemeral ports or its own
   HTTP connection pool. Needs distributed load generation (multiple JMeter
   instances/machines) and/or explicit connection-pool sizing in
   `jmeter.properties`, not a header toggle. Until this is fixed, none of the
   Load/Stress/Endurance numbers in this repo represent the application's
   real capacity — see `FINAL_REPORT.md`'s goal-by-goal verdict.
2. **Re-run Load/Stress/Endurance** once the generator is fixed, and only
   then treat the successful-request numbers as a real answer to the brief's
   performance goals.
3. **Bracket the actual break point** between 50 concurrent (clean) and 200
   concurrent (generator-limited) — e.g. 100/150 — once the generator issue
   no longer confounds the measurement. Without this there's no real answer
   to the brief's Scalability goal.
