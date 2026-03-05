#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const DEFAULT_BRANCH = "HEAD";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** parses cli flags into a small options object. */
const parseArgs = (argv) => {
  const options = {
    branch: DEFAULT_BRANCH,
    mode: "auto",
    repo: process.cwd(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--repo") {
      options.repo = argv[index + 1] ?? options.repo;
      index += 1;
      continue;
    }

    if (token === "--branch") {
      options.branch = argv[index + 1] ?? options.branch;
      index += 1;
      continue;
    }

    if (token === "--mode") {
      options.mode = argv[index + 1] ?? options.mode;
      index += 1;
      continue;
    }
  }

  return options;
};

/** runs a command and returns trimmed stdout, or null when allowed to fail. */
const runCommand = (command, args, cwd, allowFailure = false) => {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (allowFailure) {
      return null;
    }

    const stderr = error.stderr?.toString().trim();
    throw new Error(stderr || error.message);
  }
};

/** formats a date into an iso month key. */
const getMonthKey = (date) => date.toISOString().slice(0, 7);

/** formats a date into an iso week key. */
const getWeekKey = (date) => {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate - yearStart) / DAY_IN_MS + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

/** extracts a pull request number from a merge or squash commit subject. */
const getPullRequestNumber = (subject) => {
  const mergedMatch = subject.match(/Merge pull request #(\d+)/u);

  if (mergedMatch) {
    return Number(mergedMatch[1]);
  }

  const squashMatch = subject.match(/\(#(\d+)\)\s*$/u);
  return squashMatch ? Number(squashMatch[1]) : null;
};

/** sums additions and deletions from git numstat output. */
const getLinesChangedFromNumstat = (numstat) => {
  let total = 0;

  for (const line of numstat.split("\n")) {
    if (!line) {
      continue;
    }

    const [additionsRaw, deletionsRaw] = line.split("\t");
    const additions = Number.parseInt(additionsRaw, 10);
    const deletions = Number.parseInt(deletionsRaw, 10);

    total += Number.isNaN(additions) ? 0 : additions;
    total += Number.isNaN(deletions) ? 0 : deletions;
  }

  return total;
};

/** loads merged pull requests from first-parent git history. */
const getPullRequestsFromGit = (repo, branch) => {
  const logOutput = runCommand(
    "git",
    [
      "log",
      "--first-parent",
      "--format=%H%x09%aI%x09%P%x09%s",
      branch,
    ],
    repo,
  );

  const pullRequests = [];

  for (const line of logOutput.split("\n")) {
    if (!line) {
      continue;
    }

    const [sha, mergedAtRaw, parentsRaw, subject] = line.split("\t");
    const number = getPullRequestNumber(subject);

    if (number === null) {
      continue;
    }

    const parents = parentsRaw.split(" ").filter(Boolean);
    const diffArgs =
      parents.length > 1
        ? ["diff", "--numstat", `${parents[0]}`, sha]
        : ["show", "--numstat", "--format=", sha];
    const diffOutput = runCommand("git", diffArgs, repo);

    pullRequests.push({
      createdAt: null,
      linesChanged: getLinesChangedFromNumstat(diffOutput),
      mergedAt: new Date(mergedAtRaw),
      number,
      title: subject,
    });
  }

  return pullRequests.sort((left, right) => left.number - right.number);
};

/** loads pull requests from gh for exact lifecycle timing. */
const getPullRequestsFromGh = (repo) => {
  const jsonOutput = runCommand(
    "gh",
    [
      "pr",
      "list",
      "--state",
      "all",
      "--limit",
      "1000",
      "--json",
      "number,title,createdAt,mergedAt,additions,deletions",
    ],
    repo,
    true,
  );

  if (!jsonOutput) {
    return null;
  }

  const parsed = JSON.parse(jsonOutput);

  return parsed
    .map((pullRequest) => ({
      createdAt: pullRequest.createdAt ? new Date(pullRequest.createdAt) : null,
      linesChanged:
        pullRequest.mergedAt === null
          ? null
          : (pullRequest.additions ?? 0) + (pullRequest.deletions ?? 0),
      mergedAt: pullRequest.mergedAt ? new Date(pullRequest.mergedAt) : null,
      number: pullRequest.number,
      title: pullRequest.title,
    }))
    .sort((left, right) => left.number - right.number);
};

/** creates a sorted list of missing pull request numbers. */
const getMissingNumbers = (pullRequests) => {
  if (pullRequests.length === 0) {
    return [];
  }

  const seen = new Set(pullRequests.map((pullRequest) => pullRequest.number));
  const highest = Math.max(...seen);
  const missing = [];

  for (let number = 1; number <= highest; number += 1) {
    if (!seen.has(number)) {
      missing.push(number);
    }
  }

  return missing;
};

/** ensures a period bucket exists. */
const getOrCreateBucket = (buckets, key) => {
  if (!buckets.has(key)) {
    buckets.set(key, {
      avgDaysValues: [],
      created: 0,
      createdKnown: false,
      linesChanged: 0,
      merged: 0,
    });
  }

  return buckets.get(key);
};

/** builds weekly or monthly aggregates. */
const aggregateByPeriod = (pullRequests, periodKind, createdAvailable) => {
  const buckets = new Map();
  const getKey = periodKind === "week" ? getWeekKey : getMonthKey;

  for (const pullRequest of pullRequests) {
    if (createdAvailable && pullRequest.createdAt) {
      const createdBucket = getOrCreateBucket(buckets, getKey(pullRequest.createdAt));
      createdBucket.created += 1;
      createdBucket.createdKnown = true;
    }

    if (pullRequest.mergedAt) {
      const mergedBucket = getOrCreateBucket(buckets, getKey(pullRequest.mergedAt));
      mergedBucket.merged += 1;
      mergedBucket.linesChanged += pullRequest.linesChanged ?? 0;

      if (createdAvailable && pullRequest.createdAt) {
        const daysToMerge =
          (pullRequest.mergedAt.getTime() - pullRequest.createdAt.getTime()) /
          DAY_IN_MS;
        mergedBucket.avgDaysValues.push(daysToMerge);
      }
    }
  }

  return [...buckets.entries()]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([period, bucket]) => ({
      avgDays:
        bucket.avgDaysValues.length > 0
          ? bucket.avgDaysValues.reduce((sum, value) => sum + value, 0) /
            bucket.avgDaysValues.length
          : null,
      created: bucket.createdKnown ? bucket.created : null,
      linesChanged: bucket.merged > 0 ? bucket.linesChanged : null,
      merged: bucket.merged,
      period,
    }));
};

/** builds total summary values. */
const buildTotals = (pullRequests, createdAvailable) => {
  const mergedPullRequests = pullRequests.filter(
    (pullRequest) => pullRequest.mergedAt !== null,
  );
  const createdPullRequests = createdAvailable
    ? pullRequests.filter((pullRequest) => pullRequest.createdAt !== null)
    : [];
  const timedPullRequests = createdAvailable
    ? mergedPullRequests.filter((pullRequest) => pullRequest.createdAt !== null)
    : [];

  return {
    avgDays:
      timedPullRequests.length > 0
        ? timedPullRequests.reduce(
            (sum, pullRequest) =>
              sum +
              (pullRequest.mergedAt.getTime() - pullRequest.createdAt.getTime()) /
                DAY_IN_MS,
            0,
          ) / timedPullRequests.length
        : null,
    created: createdAvailable ? createdPullRequests.length : null,
    linesChanged: mergedPullRequests.reduce(
      (sum, pullRequest) => sum + (pullRequest.linesChanged ?? 0),
      0,
    ),
    merged: mergedPullRequests.length,
  };
};

/** pads a value to the left for column alignment. */
const padLeft = (value, width) => String(value).padStart(width, " ");

/** formats cell values for display. */
const formatCount = (value) => (value === null ? "-" : String(value));
const formatDays = (value) => (value === null ? "-" : value.toFixed(1));
const formatLines = (value) => (value === null ? "-" : String(value));

/** prints a single summary table. */
const printTable = (title, rows, totals) => {
  console.log(title);
  console.log("");
  console.log("Period        Created   Merged   Avg Days    Lines Δ");
  console.log("----------------------------------------------------");

  for (const row of rows) {
    console.log(
      `${row.period.padEnd(12, " ")}${padLeft(formatCount(row.created), 9)}${padLeft(
        formatCount(row.merged),
        9,
      )}${padLeft(formatDays(row.avgDays), 11)}${padLeft(
        formatLines(row.linesChanged),
        11,
      )}`,
    );
  }

  console.log("----------------------------------------------------");
  console.log(
    `${"TOTAL".padEnd(12, " ")}${padLeft(formatCount(totals.created), 9)}${padLeft(
      formatCount(totals.merged),
      9,
    )}${padLeft(formatDays(totals.avgDays), 11)}${padLeft(
      formatLines(totals.linesChanged),
      11,
    )}`,
  );
};

/** selects the best available data source. */
const loadPullRequests = (options) => {
  if (options.mode === "gh") {
    const pullRequests = getPullRequestsFromGh(options.repo);

    if (!pullRequests) {
      throw new Error("gh mode requested, but GitHub CLI data was unavailable.");
    }

    return {
      createdAvailable: true,
      missingNumbers: [],
      pullRequests,
      source: "gh",
    };
  }

  if (options.mode === "auto") {
    const pullRequests = getPullRequestsFromGh(options.repo);

    if (pullRequests) {
      return {
        createdAvailable: true,
        missingNumbers: [],
        pullRequests,
        source: "gh",
      };
    }
  }

  const pullRequests = getPullRequestsFromGit(options.repo, options.branch);

  return {
    createdAvailable: false,
    missingNumbers: getMissingNumbers(pullRequests),
    pullRequests,
    source: "git",
  };
};

const options = parseArgs(process.argv.slice(2));
const dataset = loadPullRequests(options);
const weeklyRows = aggregateByPeriod(
  dataset.pullRequests,
  "week",
  dataset.createdAvailable,
);
const monthlyRows = aggregateByPeriod(
  dataset.pullRequests,
  "month",
  dataset.createdAvailable,
);
const totals = buildTotals(dataset.pullRequests, dataset.createdAvailable);

printTable("=== WEEKLY SUMMARY ===", weeklyRows, totals);
console.log("");
printTable("=== MONTHLY SUMMARY ===", monthlyRows, totals);
console.log("");

if (dataset.source === "gh") {
  console.log("source: gh pr metadata");
} else {
  console.log("source: git mainline history");
  console.log(
    "note: created counts and avg days are unavailable in git fallback mode.",
  );

  if (dataset.missingNumbers.length > 0) {
    console.log(
      `note: missing pr numbers through #${
        Math.max(...dataset.pullRequests.map((pullRequest) => pullRequest.number))
      }: ${dataset.missingNumbers.join(", ")}`,
    );
  }
}
