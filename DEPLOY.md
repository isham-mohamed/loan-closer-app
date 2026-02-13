# Deploy Loan Closer App to GitHub Pages

This project is set up to deploy to **GitHub Pages** using GitHub Actions. Follow these steps to get your app live.

---

## Prerequisites

- A GitHub account
- This repo pushed to GitHub (e.g. `https://github.com/YOUR_USERNAME/loan-closer-app`)

---

## Step 1: Enable GitHub Pages in your repo

1. Open your repo on GitHub.
2. Go to **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: choose **GitHub Actions** (not “Deploy from a branch”).
4. Leave the rest as default. You don’t need to create a `gh-pages` branch; the workflow deploys for you.

---

## Step 2: Trigger a deploy

Deploys run automatically when you push to the `master` branch.

**Option A – Push to master**

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin master
```

**Option B – Run the workflow manually**

1. On GitHub, open your repo.
2. Click **Actions**.
3. Select **Deploy to GitHub Pages** in the left sidebar.
4. Click **Run workflow** → **Run workflow**.

---

## Step 3: Find your live URL

After the workflow finishes (usually 1–2 minutes):

1. Go to **Settings** → **Pages**.
2. You’ll see something like: **Your site is live at `https://YOUR_USERNAME.github.io/loan-closer-app/`**

If your repo has a **different name**, the URL will use that name instead of `loan-closer-app`.

---

## How it works

- The workflow file is `.github/workflows/deploy.yml`.
- On every push to `master` (or when you run the workflow manually), it:
  1. Installs dependencies with `npm ci`
  2. Builds the Angular app with the correct **base href** for your repo (e.g. `/loan-closer-app/`)
  3. Uploads the build output and deploys it to GitHub Pages

The **base href** is set to `/<your-repo-name>/` so that routes and assets load correctly on GitHub Pages.

---

## Build locally for the same base href (optional)

To test the same paths as on GitHub Pages:

```bash
npm run build:gh-pages
```

This builds with `--base-href /loan-closer-app/`. If your repo name is different, run:

```bash
ng build --base-href /YOUR_REPO_NAME/
```

Then serve the `dist/loan-closer-app/browser` folder with any static server (e.g. `npx serve dist/loan-closer-app/browser`) and open the app at `http://localhost:3000/loan-closer-app/`.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| **404 on refresh or direct URL** | Make sure **Source** in Settings → Pages is **GitHub Actions**, and that the workflow uses `--base-href /YOUR_REPO_NAME/`. |
| **Blank page or wrong base** | If your repo name is not `loan-closer-app`, the workflow uses the repo name automatically. For a custom base, edit `.github/workflows/deploy.yml` and change the `--base-href` in the Build step. |
| **Workflow fails** | Open the **Actions** tab, click the failed run, and check the logs. Common fixes: run `npm ci` and `npm run build` locally to ensure the project builds. |

---

## Summary checklist

- [ ] Repo is on GitHub
- [ ] Settings → Pages → Source is **GitHub Actions**
- [ ] Push to `master` (or run the workflow manually)
- [ ] Wait for the workflow to complete, then open the URL from Settings → Pages

Your app will be available at: **`https://<your-username>.github.io/<repo-name>/`**
