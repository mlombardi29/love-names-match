# Kinetic Haus — Setup Guide

A premium, mobile-first workout tracker. Everything lives in **one `index.html`
file**, and your data is stored in **your own Google Sheet** via a tiny Google
Apps Script backend.

You do **not** need to be a developer. Follow the steps below — it takes about
10 minutes, and you only do it once.

---

## What you'll end up with

- A workout app you can open on your phone (and "Add to Home Screen").
- All your workouts, templates and progress saved in a Google Sheet you own.
- Works offline too — if you skip the Google steps, the app still runs and
  saves to your phone/browser only.

---

## Part 1 — Create the Google Sheet (2 min)

1. Go to **[sheets.new](https://sheets.new)** (this creates a blank Google
   Sheet).
2. Rename it something like **"Kinetic Haus Data"** (top-left).
3. Leave it open — you'll use it in the next step.

> You don't need to add any tabs or headers. The script creates the
> `Logs`, `Days`, and `Settings` tabs automatically.

---

## Part 2 — Add the backend script (4 min)

1. In your Sheet, click the menu **Extensions → Apps Script**.
2. A code editor opens in a new tab. Delete whatever sample code is shown
   (usually `function myFunction() {}`).
3. Open the file **`Code.gs`** from this folder, copy **everything**, and paste
   it into the Apps Script editor.
4. Click the **💾 Save** icon (or press Ctrl/Cmd-S).

---

## Part 3 — Deploy it as a Web App (3 min)

1. In the Apps Script editor, click the blue **Deploy** button (top-right) →
   **New deployment**.
2. Click the **gear ⚙️ icon** next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description:** `Kinetic Haus`
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone**
     *(This means "anyone with the secret URL". The URL is long and private —
     don't share it and your data stays yours.)*
4. Click **Deploy**.
5. Google will ask you to **authorize**:
   - Click **Authorize access** → choose your Google account.
   - You may see **"Google hasn't verified this app"** — this is normal for
     personal scripts. Click **Advanced → Go to Kinetic Haus (unsafe)** →
     **Allow**. (It's *your* script accessing *your* sheet.)
6. After deploying you'll see a **Web app URL** ending in **`/exec`**.
   **Copy it.**

> 🔁 If you ever edit `Code.gs` later, you must redeploy: **Deploy → Manage
> deployments → ✏️ edit → Version: New version → Deploy.**

---

## Part 4 — Connect the app (1 min)

1. Open **`index.html`** in your phone or computer browser
   (double-click the file, or host it — see "Hosting" below).
2. Tap the **gear icon ⚙️** in the top-right.
3. Paste your **Web app URL** into the **Google Apps Script URL** field.
4. Choose **KG** or **LBS**.
5. Tap **Save & Sync**.

A green dot near the gear means you're connected. 🎉

---

## Using the app

- **Four day templates** come pre-loaded the first time you open the app:
  *Legs & Functional Core*, *Upper Body & Toning*, *Chest & Arms*, and
  *Back, Shoulders & Core*. Edit or delete them any time under **Manage**.
- **Free Form Workout** — start blank and add exercises as you go.
- **Start a Day** — tap a template to pre-load its exercises and sets.
- **Manage** (top of "Start a Day") — create / edit / reorder workout days.
- **Logging** — type weight + reps, tap the **✓** to mark a set done. Tap
  **+ SET** to add sets on the fly. Everything **auto-saves**.
- **Add exercise** — search a built-in library of 200+ common gym & at-home
  movements (with variations like *Bench Press / Incline / Decline / Smith*).
  Type anything custom and it's remembered for next time; your most-used
  exercises rise to the top of the list.
- **Save & Later** — pause a workout; it shows as a big **RESUME** card on Home.
- **Finish** — completes the workout and files it in History.
- **History** tab — search and re-open/edit any past workout.
- **Progress** tab — pick a timeframe (defaults to **6 weeks**) for the
  *Consistency* and *Weight Moved* charts; tap any exercise for **weight** and
  **reps** progression over time with **personal-best** markers. Earn
  **Achievements** (Weekend Warrior, Perfect Week, PR Setter, Centurion, and
  more) as you train.
- **Logo / link** — the header logo (and the ↗ button next to it) open
  **kinetichaus.com**.

> **Using your exact logo file:** the app reproduces the Kinetic Haus mark as a
> crisp white vector so it stays one self-contained file. To drop in the
> official artwork instead, open `index.html`, find `KH_LOGO_OVERRIDE` near the
> top of the script, and set it to a data-URI or path of your white/transparent
> logo. Nothing else needs to change.

---

## Hosting on your phone (optional but recommended)

The easiest options to get it on your phone:

- **Quickest:** email yourself `index.html`, open it on your phone, and use
  your browser's **"Add to Home Screen"** for an app-like icon.
- **Best:** drop `index.html` into a free static host:
  - [Netlify Drop](https://app.netlify.com/drop) — drag the file in, get a link.
  - [GitHub Pages](https://pages.github.com/) — push and enable Pages.
  - Google Drive / Dropbox public link also works.

Once it's a URL, open it on your Pixel and **Chrome menu → Add to Home Screen**.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Gear shows **"Not reachable"** | Re-check the URL ends in `/exec`. Make sure "Who has access" = **Anyone**. |
| **Authorization** screen keeps appearing | Finish the "Advanced → Go to… → Allow" flow once; it won't ask again. |
| Edited `Code.gs`, nothing changed | You must **redeploy a new version** (Part 3, blue note). |
| Data not syncing across devices | Both devices must use the **same** Web app URL. |
| Nothing saves / sandboxed browser | The app falls back to device storage automatically. Add the URL to sync. |
| Charts empty | Charts appear after you **complete** at least one workout. |

---

## Data model (what's in your Sheet)

**Logs** — one row per set:

| workoutId | date | workoutName | status | exercise | exerciseOrder | setNumber | weight | reps | unit | completed | exerciseNotes | workoutNotes | updatedAt |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

**Days** — one row per exercise in a template:

| dayName | exercise | defaultSets | order |
|---|---|---|---|

**Settings** — key/value:

| key | value |
|---|---|
| unit | kg |

You can read these tabs directly in Google Sheets any time — it's your data.

---

## Privacy & safety notes

- "Who has access: Anyone" means *anyone with the long secret URL*, not the
  public. Treat the URL like a password.
- The script only ever touches the single Sheet it's attached to.
- No third-party servers are involved — just your browser ⇄ your Google Sheet.
