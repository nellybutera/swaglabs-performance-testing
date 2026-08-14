# Swag Labs Performance Testing

JMeter load testing of [Swag Labs](https://www.saucedemo.com/) — an AmaliTech
Training Academy [Performance Testing](https://github.com/AmaliTech-Training-Academy/Quality-Assurance-Labs/blob/master/Performance%20Testing/Performance%20Testing%20with%20JMeter.md)
lab assignment.

📊 **[View the HTML reports on GitHub Pages](https://nellybutera.github.io/swaglabs-performance-testing/)**

## Read these first

- **[TEST_PLAN.md](TEST_PLAN.md)** — how the tests were built and why, including
  a few real problems found along the way
- **[FINAL_REPORT.md](FINAL_REPORT.md)** — the actual results

## The short version

Swag Labs turned out to have no backend at all — it's a static single-page app,
confirmed by checking its source. So this test isn't really hitting five
different API endpoints, it's hitting the same static page five different ways.
That's explained fully in `TEST_PLAN.md`, and the test plan still covers all
five flows the brief asks for (login, search, product details, cart, checkout).

## What's in this repo

| Path | What it is |
|---|---|
| `TEST_PLAN.md` | How the tests were designed, and why |
| `FINAL_REPORT.md` | The results |
| `jmeter/tier-*.jmx` | The 5 test plans — baseline, load, stress, endurance, and a smoke test against the real site |
| `reports/<tier>/` | HTML dashboard for each run |
| `EVIDENCE_CHECKSUMS.txt` | Checksums so the raw result files can be verified |
| `app-under-test/` | A local copy of Swag Labs + the Docker setup to run it |
| `docker-compose.yml`, `grafana/` | Optional: watch metrics live in Grafana while a test runs |
| `.github/workflows/` | CI — runs a quick smoke test on every push and publishes the reports to GitHub Pages |

**No Allure here.** My other repos use Allure for functional tests (pass/fail
per test case), but a performance test produces a stream of numbers over time,
not pass/fail results — so it's plain JMeter HTML reports plus an optional
Grafana dashboard instead, which fit that kind of data better.

## Running it yourself

```bash
# 1. Build and start the target app locally
docker build -f app-under-test/Dockerfile.perf -t swaglabs-perf-target ./app-under-test
docker run -d --name swaglabs-perf-target -p 8080:80 swaglabs-perf-target

# 2. Run any tier
jmeter -n -t jmeter/tier-baseline.jmx -l results/baseline.jtl -e -o reports/baseline

# Check a result file against the committed checksums
sha256sum -c EVIDENCE_CHECKSUMS.txt
```

Always wrap a real run in a timeout — a config mistake caused a couple of test
runs to go on for hours before anyone noticed, so every run here now looks like:

```bash
timeout -k 10 <expected duration + buffer> jmeter -n -t jmeter/tier-<name>.jmx ...
```

### Optional: live Grafana dashboard

```bash
docker compose up -d
# then open http://localhost:3000 while a test runs
```

![Grafana dashboard with live data](grafana-dashboard.png)

## A few things worth knowing

- Load/stress/endurance tests run against a **local copy** of the app, not the
  real saucedemo.com — it's not this project's site to load-test.
- A quick check against the real site was still run, just at low volume, and it
  actually caught something: the real site 404s on some direct links that the
  local copy doesn't (details in `TEST_PLAN.md`).
- One run showed a scary ~90% "error rate" at higher concurrency. It turned out
  the app server logged zero errors the whole time — the failures were happening
  somewhere else in the test setup, not in the app. That's written up honestly
  in `TEST_PLAN.md` instead of being hidden or misreported as a real bug.
