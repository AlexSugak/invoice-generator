# Saving of Invoice Draft

- Where and how do we store data (drafts)?
  - Add new `user_drafts` (userName, name (draft name), params), unique(userName + name)
- How to get this data (API?)
  - Add new API endpoint to store draftrs: PUT `api/users/<user>/drafts/<name name>` { params: {...} }
  - Add new API endpoint to read draft details: GET `api/users/<user>/drafts/<draft name>` { params: {...} }
- How the feature will work (behavior)?
  - On first page load, GET `api/users/<user>/drafts/invoice` and use that params as initial state
  - Initial version: on interval (2 sec), PUT with latest params state
  - Future optimizations: check if any changes, PUT with debaunce (5 sec), or use web sockets, OR save on page leave

- [Optional] How we will test?
- [Optional] How we will monitor?
- [Optional] How we will deploy (A/B test)?
- [Optional] How we will measure (metrics)?

PUT vs POST
PUT: idempotent (can call many times with same effect)
POST: not idempotent (some effect)

# Homework (day 1)

- Make it possible to set draft name
- Be able to select draft from the list of previously saved drafts
- Create tech design: answer main questions
- Add new endpoint? Get all drafts for user?
- Continue to save drafts every 2 seconds? Or use separate button? (UX)
- Make PR

# Homework (day 2)

- Add e2e tests for new endpoints which you added before
- If did not do day1 homework: create new endpoint (e.g. settings)
- [OPTIONAL]: add new web e2e tests (playwright) for new features
- Extend `.github/workflows/pr-checks.yml`: add prettier format check
  - add prettier:check script
  - add prettierignore to skip formatting check for e.g. node_modules
  - extend `pr-checks.yml` to run this new script

# Solution

- Where and how do we store different drafts?
  - Use existing table `user_drafts`
  - Update API to be able to pass draft name: PUT `api/users/<user>/drafts/<draft name>` { params: {...} }

- How do we get the drafts list for each user?
  - Add API to read user drafts: GET `api/users/<user>/drafts`

- How the feature will work (behavior)?
  - On first page load use the initial state with empty form fields
  - Allow user to select from existing drafts and fill the form fields with this data
  - Add a button that allows saving/editing a draft: a modal will be opened, user can type a new draft name or use the selected draft name, and save or delete draft by providing the name
  - After saving/editing the new draft list will be requested
  
# Homework (day 3)

- Add Sentry integration to web app
- Try to fix "no items -> 500 response" error by writing API e2e test first 
- (*) configure Sentry<->Next.js sourcemap integration
- (*) update web Dockerfile (web build step)
- (*) unify loggig, add Sentry logger implemenation, 
      refactor to remove explicit calls to Sentry
