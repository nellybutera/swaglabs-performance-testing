# Swag Labs Performance Testing

[![Performance smoke test](https://github.com/nellybutera/swaglabs-performance-testing/actions/workflows/performance-smoke.yml/badge.svg)](https://github.com/nellybutera/swaglabs-performance-testing/actions/workflows/performance-smoke.yml)

📊 **[View the HTML dashboards on GitHub Pages](https://nellybutera.github.io/swaglabs-performance-testing/)**

## What this is

JMeter load testing of [Swag Labs](https://www.saucedemo.com/) — an AmaliTech
Training Academy Performance Testing lab assignment — covering the brief's 5
required flows (login, search, product details, cart, checkout) at 5
concurrency tiers. One thing shapes every result below: Swag Labs has no
server-side application logic — it's a 100% client-side static page, confirmed
against its own source (`TEST_PLAN.md` §2). So this test measures static-asset
delivery under load, not backend business-transaction performance, and the
brief's thresholds are read accordingly.

## Findings at a glance

| Tier | Concurrent users | Duration | Error rate | P95 response time | Successful throughput |
|---|---|---|---|---|---|
| Baseline | 50 | 23s | **0%** | 79ms | 10.9 req/s |
| Load-Medium | 150 | 5m 12s | 52.95% | 1.3s | 35.7 req/s |
| Load-Peak | 300 | 5m 18s | 72.79% | 4.4s | 33.7 req/s |
| Stress | 500 | 5m 21s | 84.79% | 10.2s | 28.1 req/s |
| Endurance | 150 | 10m 17s | 58.27%* | 1.2s | 34.2 req/s |

\* Endurance is highly variable run to run — an earlier run of this identical
tier came back at 0.01% error. See "A few things worth knowing" below; that
swing is treated as a finding, not averaged away.

These 5 are the performance tiers, all against the local target. Separately,
a **functional smoke check against the real saucedemo.com** (5 users, low
volume, not part of the performance evidence above) caught a real routing
divergence — see "A few things worth knowing" below.

**Against the brief's 4 stated goals — the honest verdict is "not verified/not
met," not "met":**

| Goal | Target | Result |
|---|---|---|
| Response time | < 2s | **Not met** at 150+ concurrent (1.2–10.2s P95). Baseline alone is a sanity check, not a load test. |
| Throughput | 500 req/s | **Not met.** Sits in a 28–36 req/s band and doesn't rise with concurrency. |
| Error rate | ≤ 1% | **Not met, on any sustained tier** — including Endurance, despite one earlier run showing 0.01%. |
| Scalability | Evaluate under increasing load | **Not conclusive** — Endurance's own two runs vary more (0.01% to 58.27%, both at 150 users) than the concurrency progression does. |

**Why the failures aren't an application bug:** the app's own server logs show
zero errors across every run — every request that reached it succeeded. The
failures trace to the test generator's own TCP port/connection limits under
sustained concurrency, diagnosed down to the exact exception type in
`FINAL_REPORT.md` and `TEST_PLAN.md` §6b. That diagnosis, not a clean pass on
the brief's numbers, is this project's actual finding.

## How the required flows map to requests

**A note on "search":** Swag Labs' standard UI has no search feature — no
search box, no query endpoint, checked directly against the app's source.
What's tested as "search" below is the **product inventory listing page**
(`GET /inventory.html`) — the closest real equivalent the app has to
browsing/finding products. That's a deliberate substitution, stated plainly
here rather than left for a reviewer to wonder whether a request was just
relabeled.

Every one of the 5 required flows is tested identically at every performance tier:

| Flow (brief) | What's actually requested | Baseline | Load-Medium | Load-Peak | Stress | Endurance |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Login | `GET /` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search | `GET /inventory.html` (see note above) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Product details | `GET /inventory-item.html` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cart | `GET /cart.html` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Checkout | `GET /checkout-step-one.html` | ✓ | ✓ | ✓ | ✓ | ✓ |

**JMeter test plan structure** — every tier file follows this shape; only the
Thread Group's numbers differ between tiers:

```
Test Plan
├── User Defined Variables (protocol / host / port)
├── HTTP Request Defaults
├── HTTP Header Manager (Connection: close — see TEST_PLAN.md §6)
├── Thread Group (users / ramp-up / duration — the only part that differs per tier)
│   ├── 01 Login          → GET /                      + assertions
│   ├── 02 Inventory      → GET /inventory.html         + assertions
│   ├── 03 Inventory Item → GET /inventory-item.html    + assertions
│   ├── 04 Cart           → GET /cart.html              + assertions
│   └── 05 Checkout       → GET /checkout-step-one.html + assertions
├── Uniform Random Timer (1–3s think time, applies to every request)
└── Listeners (Summary Report, Aggregate Report, View Results Tree)
```

**Assertions** — every request carries two:
- **Response code assertion** — expects HTTP `200`.
- **Response body assertion** — expects the page to contain `<title>Swag Labs</title>`.

One honest limitation: the body assertion is the **same generic string on
every flow**, not flow-specific content (it doesn't check the cart page for
cart-specific text, for example). It confirms the response actually came from
this app rather than a routing/proxy error — it doesn't independently verify
each page rendered its intended content. A stronger version would assert
different text per flow; flagged here rather than left implicit.

## What to look at, in order

1. **[GitHub Pages dashboards](https://nellybutera.github.io/swaglabs-performance-testing/)** — the HTML report per tier, charts and all. No setup, just click.
2. **[`FINAL_REPORT.md`](FINAL_REPORT.md)** — full results, the root-cause diagnosis, and the goal-by-goal verdict behind the table above.
3. **[`TEST_PLAN.md`](TEST_PLAN.md)** — methodology, design decisions, and the investigation trail (including a runaway-test incident and how it was prevented from recurring).
4. **[Actions tab](https://github.com/nellybutera/swaglabs-performance-testing/actions)** — the pipeline itself: a baseline check runs on every push, a weekly scheduled Load-Medium run, and any tier can be triggered on demand.

## Deliverables checklist

| Brief requirement | Where |
|---|---|
| Performance Test Plan Documentation | [`TEST_PLAN.md`](TEST_PLAN.md) |
| JMeter Test Plan (`.jmx`) | [`jmeter/`](jmeter/) — 6 files, all 5 flows, all with think-time timers |
| HTML Dashboard Reports | [`reports/<tier>/`](reports/), live on [GitHub Pages](https://nellybutera.github.io/swaglabs-performance-testing/) |
| CI/CD Integration | [`.github/workflows/performance-smoke.yml`](.github/workflows/performance-smoke.yml) — runs, gates on SLA, and publishes automatically |
| Final performance summary report | [`FINAL_REPORT.md`](FINAL_REPORT.md) — metrics, bottleneck ID, root-cause analysis |

## A few things worth knowing

- Load/stress/endurance tests run against a **local copy** of the app, not the
  real saucedemo.com — it's not this project's site to load-test.
- A quick check against the real site was still run, just at low volume, and it
  actually caught something: the real site 404s on some direct links that the
  local copy doesn't (details in `TEST_PLAN.md`).
- The generator-side error rates above are real, but confirmed not an app
  issue — the app server logged zero errors the whole time. Written up
  honestly in `FINAL_REPORT.md` instead of hidden or misreported as a bug.
- Endurance was run twice with identical config: 0.01% error once, 58.27% the
  next time. That swing is reported as-is, not smoothed into a single number
  — see `FINAL_REPORT.md`'s "Endurance" section for why it's treated as
  evidence of a timing-sensitive failure rather than picking whichever run
  looked better.

## Repo map

| Path | What it is |
|---|---|
| `jmeter/tier-*.jmx` | The 6 test plans — baseline, load-medium (150), load-peak (300), stress, endurance, smoke (real site) |
| `results/`, `EVIDENCE_CHECKSUMS.txt` | Raw result files + checksums to verify them |
| `app-under-test/` | Local copy of Swag Labs + the Docker setup to serve it |
| `docker-compose.yml`, `grafana/` | Optional: watch metrics live in Grafana while a test runs |

## Running it yourself

```bash
# 1. Build and start the target app locally
docker build -f app-under-test/Dockerfile.perf -t swaglabs-perf-target ./app-under-test
docker run -d --name swaglabs-perf-target -p 8080:80 swaglabs-perf-target

# 2. Run any tier (always wrap in a timeout -- see TEST_PLAN.md section 6 for why)
timeout -k 10 400 jmeter -n -t jmeter/tier-baseline.jmx -l results/baseline.jtl -e -o reports/baseline

# Check a result file against the committed checksums
sha256sum -c EVIDENCE_CHECKSUMS.txt
```

### Optional: live Grafana dashboard

```bash
docker compose up -d
# then open http://localhost:3000 while a test runs
```

![Grafana dashboard with live data](grafana-dashboard.png)
