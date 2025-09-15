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

# Design

- Where and how do we store data (drafts)?
    - Reuse existing table `user_drafts`
- How to store different drafts (multiple drafts per user)?
    - Change the API endpoint to accept dynamic `draftName`
- How to get all the drafts?
    - Add a new API endpoint GET to read all the user-related drafts: GET `api/users/<user>/drafts

- How will the feature work (behavior)?
    - Ability to save invoice as a named draft
    - Separate page to manage drafts
    - Select draft to load it into the editor
    - Delete draft
    - Edit draft name
