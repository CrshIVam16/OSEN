# DevSOS

DevSOS is a small, static debugging guide for developers at every experience level. It offers practical, topic-based troubleshooting steps and helps turn a problem description into a clear GitHub Discussion draft.

## Run locally

Open `index.html` in a browser, or serve the repository root with any static file server. There is no build step, dependency install, backend, or API key.
- [live-link](https://osen-github.netlify.app/)

## How it works

- The interactive guide runs entirely in the browser and uses a small set of deterministic troubleshooting playbooks. It does not send the problem text to a server or claim to generate AI answers.
- When a visitor chooses **Prepare a help request**, DevSOS formats a question, copies it to the clipboard, and opens the repository's GitHub Discussions Q&A page. The visitor reviews and posts it; community members provide replies there.
- The problem text stays in the browser unless the visitor chooses to share it. Remind users not to post credentials, personal information, or private code.

## Enable community Q&A

The community link targets `CrshIVam16/OSEN` and its `q-a` Discussions category. Before launching the community feature:

1. Enable **Discussions** in the repository's **Settings → General → Features**.
2. Confirm that the **Q&A** category has the `q-a` URL slug. Update `COMMUNITY_URL` in `app.js` if the repository or category differs.
3. Add community guidelines and moderation coverage before inviting public posts.

Until Discussions are enabled and configured, the community link will not work.

## AI and data storage

This first version is intentionally frontend-only. Its suggestions are curated troubleshooting checks, not AI-generated diagnoses. To add AI safely, use a backend or serverless function to protect provider credentials, explain what data is sent, and handle abuse and cost limits. To keep submitted questions on the site itself, add a backend/database; GitHub Discussions is the hosted community destination for this version.
