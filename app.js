const COMMUNITY_URL = "https://github.com/CrshIVam16/OSEN/discussions/new?category=q-a";

const playbooks = {
  javascript: {
    title: "Let's trace what the code is telling you.",
    intro: "A small runtime error often points to a value or assumption that changed. Try narrowing down exactly where it happens.",
    steps: [
      "Read the first useful error line, then open the file and line number named in the stack trace.",
      "Log the value just before the failing line. Check whether it is undefined, null, or a different shape than expected.",
      "Trace where that value comes from—especially async data, props, API responses, and array lookups.",
      "Try the smallest safe fix, then rerun the same action and the related test."
    ]
  },
  git: {
    title: "Let's make Git show us the current state.",
    intro: "Before changing anything, inspect your working tree and branch. A clear snapshot usually makes the next move obvious.",
    steps: [
      "Run <code>git status</code> and read which branch you are on and what files are changed.",
      "Run <code>git diff</code> to review unstaged edits. Save a copy of important work before trying a reset or rebase.",
      "If a command failed, read the full message and check whether the branch or remote name is correct with <code>git branch -vv</code>.",
      "If you are in a merge or rebase, check <code>git status</code> for the exact next action. Avoid force-pushing shared branches."
    ]
  },
  build: {
    title: "Let's get the project building one step at a time.",
    intro: "Build failures can come from code, dependencies, or a mismatched environment. Start with the very first error, not the last cascade.",
    steps: [
      "Rerun the build or test and find the first error message. Later errors may just be consequences.",
      "Check the exact script in <code>package.json</code> (or your project's equivalent) and use the package manager matching its lockfile.",
      "Look for a missing import, type mismatch, failing test assertion, or unsupported runtime version in the first relevant error.",
      "Make one change, then rerun the smallest failing test or build command to check whether the cause is fixed."
    ]
  },
  api: {
    title: "Let's follow the request from start to finish.",
    intro: "An API issue gets easier when you separate the request, the response, and what your app does with it.",
    steps: [
      "Open the browser Network tab (or request logs) and inspect the URL, method, payload, and status code.",
      "Check the response body. A 4xx usually points to the request; a 5xx usually needs server-side investigation.",
      "Verify headers, authentication, content type, and required fields—without sharing tokens or personal data.",
      "Try the same request in a safe API client or curl, then compare it with what your app sends."
    ]
  },
  frontend: {
    title: "Let's isolate what the browser is actually rendering.",
    intro: "For visual bugs, check the element and its computed styles first. The browser can tell you which rule is winning.",
    steps: [
      "Inspect the element in browser devtools and check its computed styles, dimensions, and parent layout.",
      "Temporarily toggle suspicious CSS rules off to find which rule causes the issue.",
      "Check for overflow, unexpected margins, flex/grid sizing, and different styles at the current viewport width.",
      "Test the smallest CSS change at both a narrow and wide screen before calling it fixed."
    ]
  },
  deploy: {
    title: "Let's compare the working app with the deployed one.",
    intro: "Deploy-only bugs often come from environment differences. Compare logs and configuration before changing working code.",
    steps: [
      "Check the deployment build log for the first error, and confirm which commit and branch were deployed.",
      "Compare runtime versions and required environment variable names with your local setup. Never paste secret values into a public report.",
      "Check whether file paths or filename casing differ; some deployment systems run on case-sensitive filesystems.",
      "Reproduce the production build locally if possible, then redeploy one verified change."
    ]
  },
  other: {
    title: "Let's turn the mystery into something testable.",
    intro: "You do not need to know the cause yet. We can reduce the problem to a small example and follow the evidence.",
    steps: [
      "Write down what you expected, what happened instead, and the exact steps that trigger it.",
      "Check the first warning or error in the logs or browser console, not just the final symptom.",
      "Change or remove one thing at a time until you can identify the smallest example that still fails.",
      "Search the exact error text with the tool, language, or framework version. Verify any suggested fix before applying it."
    ]
  }
};

const form = document.querySelector("#debug-form");
const problemField = document.querySelector("#problem");
const categoryField = document.querySelector("#category");
const results = document.querySelector("#results");
const resultTitle = document.querySelector("#result-title");
const resultIntro = document.querySelector("#result-intro");
const stepsList = document.querySelector("#steps-list");
const toast = document.querySelector("#toast");
const helpDraft = document.querySelector("#help-draft");
const helpRequestField = document.querySelector("#help-request");
let lastToastTimeout;
let currentProblem = "";
let currentCategory = "other";

function inferCategory(text) {
  const value = text.toLowerCase();
  if (/\b(git|github|merge conflict|rebase|commit|branch|push|pull request)\b/.test(value)) return "git";
  if (/\b(deploy|deployment|production|environment variable|build pipeline|hosting|github pages)\b/.test(value)) return "deploy";
  if (/\b(api|fetch|request|response|http|network|cors|endpoint|401|403|404|500)\b/.test(value)) return "api";
  if (/\b(css|html|layout|style|responsive|button|font|render|visual|overflow)\b/.test(value)) return "frontend";
  if (/\b(test|testing|build|compile|dependency|npm|package|module not found|typescript|type error)\b/.test(value)) return "build";
  if (/\b(javascript|typescript|react|vue|node|undefined|null|syntaxerror|referenceerror|typeerror)\b/.test(value)) return "javascript";
  return "other";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(lastToastTimeout);
  lastToastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

function addStep(text) {
  const item = document.createElement("li");
  const parts = text.split(/(<code>.*?<\/code>)/g);
  for (const part of parts) {
    if (part.startsWith("<code>") && part.endsWith("</code>")) {
      const code = document.createElement("code");
      code.textContent = part.slice(6, -7);
      item.append(code);
    } else {
      item.append(document.createTextNode(part));
    }
  }
  stepsList.append(item);
}

function renderPlaybook(category) {
  const playbook = playbooks[category] || playbooks.other;
  resultTitle.textContent = playbook.title;
  resultIntro.textContent = playbook.intro;
  stepsList.replaceChildren();
  playbook.steps.forEach(addStep);
}

function makeHelpRequest() {
  return [
    "## What I'm trying to do",
    "[Describe the goal]",
    "",
    "## What happened",
    currentProblem,
    "",
    "## What I've tried",
    "[List the steps or fixes you've already tried]",
    "",
    "## Environment",
    `[Language/framework/tool versions: add what you know]`,
    "",
    "## Smallest reproduction",
    "[Steps, sample code, or a link that reproduces the issue. Remove secrets and private data.]"
  ].join("\n");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentProblem = problemField.value.trim();
  if (!currentProblem) {
    problemField.focus();
    return;
  }
  currentCategory = categoryField.value === "auto" ? inferCategory(currentProblem) : categoryField.value;
  renderPlaybook(currentCategory);
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#reset-button").addEventListener("click", () => {
  results.hidden = true;
  helpDraft.hidden = true;
  problemField.focus();
  document.querySelector("#debugger").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#community-button").addEventListener("click", async () => {
  const request = makeHelpRequest();
  window.open(COMMUNITY_URL, "_blank", "noopener,noreferrer");
  try {
    await navigator.clipboard.writeText(request);
    helpDraft.hidden = true;
    showToast("Help request copied. Paste it into your community discussion.");
  } catch {
    helpRequestField.value = request;
    helpDraft.hidden = false;
    helpRequestField.focus();
    helpRequestField.select();
    showToast("Automatic copy isn't available. Your formatted request is shown below to copy manually.");
  }
});

document.querySelector("#select-draft-button").addEventListener("click", () => {
  helpRequestField.focus();
  helpRequestField.select();
  showToast("Draft selected. Copy it, then paste it into the community discussion.");
});
