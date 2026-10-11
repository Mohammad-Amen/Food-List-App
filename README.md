# قائمتي: Food List App

An Android app (Arabic, right-to-left) for sending shopping and food lists between family members.

## What it does

- **Accounts with no verification.** Pick a name and a password. The app adds a random 4-digit tag, Discord-style: `أمي#4821`. Give that handle to your family so they can send you lists.
- **Lists of items.** Each item has a name, a quantity (with − / + buttons), a unit (حبة، كيلو، لتر …), a category, and an optional note. There are one-tap suggestions for common groceries.
- **Send and receive.** A new list starts as a draft. Send it to someone by their handle, or tap one of the people you've exchanged lists with before.
- **The "seen" lock:**

  | List state | Who can add, edit or delete items | Who can tick items as bought |
  |---|---|---|
  | Draft (مسودة) | Owner only | Owner |
  | Sent (جديدة) | Owner **and** recipient | Both |
  | Seen (تمت المشاهدة) | **Nobody** | Both |

  Only the recipient can press "تمت المشاهدة". It asks for confirmation and can't be undone. The lock is enforced on the server by `firestore.rules`, not only in the app.
- **Live updates.** Both phones update instantly. The Inbox tab shows a badge for unseen lists.
- **Extras.** Items are grouped by category, with a progress bar ("تم شراء 3 من 7"). You can see who added each item, share a list as text (for example on WhatsApp), reuse an old list, and send a copy of a list to someone else.

> ⚠️ There is no email, so a **forgotten password cannot be recovered**. The app warns about this at sign-up.

## Tech

Expo (React Native) + TypeScript + Expo Router, with Firebase Auth and Cloud Firestore (free Spark plan).

```
src/app/            screens (Expo Router)
src/lib/            firebase, data access, permissions, username logic, Arabic strings
src/components/     shared UI
firestore.rules     server-side security (mirrors src/lib/permissions.ts)
tests/              unit tests + Firestore rules tests
```

## Setup (about 10 minutes, one time)

### 1. Create a Firebase project
1. Go to <https://console.firebase.google.com> and click **Add project**. Analytics isn't needed.
2. Go to **Build → Authentication → Get started → Sign-in method**, and enable **Email/Password**.
   The app uses hidden internal emails; users never see or type one.
3. Go to **Build → Firestore Database → Create database**. Pick a nearby location and start in **production mode**.
4. Go to **Project settings (⚙️) → General → Your apps**, click the **Web** icon `</>`, and register an app (any nickname).
   Copy the `firebaseConfig` values.

### 2. Configure the app
```bash
npm install
cp .env.example .env     # then paste your firebaseConfig values into .env
```

### 3. Deploy the security rules
```bash
npx firebase login
npx firebase use --add          # pick your project
npx firebase deploy --only firestore:rules
```

### 4. Run it on your phone
1. Install **Expo Go** from the Play Store.
2. Run `npx expo start` and scan the QR code with Expo Go.

The first time, Expo Go may show the layout left-to-right. Close the app and open it again and it switches to right-to-left. Installed builds (below) are always right-to-left.

### 5. Build an installable APK for your parent
`.env` is not uploaded to the cloud build, so the APK needs the config in `eas.json` too:

1. Open `eas.json` and paste the same six values from your `.env` into `build.base.env`.
   They are public identifiers, not passwords, so they're safe to commit. Security comes from `firestore.rules`.
2. Build:
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest build -p android --profile preview
   ```
EAS builds it in the cloud for free and gives you a download link for the `.apk`. Open the link on the phone to install.

## Development

```bash
npm run typecheck     # TypeScript
npm test              # unit tests (permissions, usernames)
npm run test:rules    # Firestore security rules against the local emulator (needs Java)
```

If you change who can do what, update **both** `src/lib/permissions.ts` and `firestore.rules`, then run both test suites.

## Not included yet

- **Push notifications** when a list arrives. Real background pushes need Cloud Functions, which require Firebase's paid Blaze plan. For now the app updates live while it's open, and the Inbox badge shows new lists.
