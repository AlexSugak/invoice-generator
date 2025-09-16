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

# Homework

- Make it possible to set draft name
- Be able to select draft from the list of previously saved drafts
- Create tech design: answer main questions
- Add new endpoint? Get all drafts for user?
- Continue to save drafts every 2 seconds? Or use separate button? (UX)
- Make PR

# Tech design: Homework-1

- On first page load don't fetch draft details
- Add endpoint GET `api/users/<user>/drafts`, returns a list of available draft names only (no details)
- Add a Select component with available drafts, When a draft is selected -> fetch draft details by its name.
- Add checkbox "Save draft"
- When checkbox is selected -> show input field "Enter draft name"
- On clicking "Create invoice", if the checkbox is selected -> save a new draft with the entered name