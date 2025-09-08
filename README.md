# Invoice Generator

An simple web app that can be used to generate invoice PDFs. Users can edit invoice content: line items, company names, addresses, TAXes and total costs etc. using simple interface. Users can also optionally authenticate and save invoice templates for later use

## Architecture

- UI: nextjs app, TypeSript, Tailwind CSS;
- Backend: nest.js JSON over http API;
- Storate: Postgresql DB
- Deployment: docker-compose running in VM
- Monitoring: logs and error reports via Sentry

## Installation

To run the code locally you will need:

- installed node.js. E.g. [install NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) and then run `nvm use` from repo root;
- yarn as a package manager. Just run 'yarn' in repo root;

After that is done:

- copy `.env.example` file to your local `.env` (make sure that it is not commited);
- run docker-compose with DB and other dependencies: `yarn docker:up`
