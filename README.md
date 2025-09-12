# Invoice Generator

A simple web app that can be used to generate invoice PDFs. Users can edit invoice content: line items, company names, addresses, TAXes and total costs etc. using simple interface. Users can also optionally authenticate and save invoice templates for later use

## Architecture

- UI: nextjs app, TypeSript, Tailwind CSS;
- Backend: nest.js JSON over http API;
- Storate: Postgresql DB
- Deployment: docker-compose running in VM

The project is a monorepo with number of packages (see `./packages`):

- common: contains code shared among some of the other packages
- db: database migrations and other scripts
- pdf-api: a nest.js API that generates PDF files from pre-configured templates
- web: next.js app of the main website and invoice PDF editor

## Local development

To run the code locally you will need:

- installed node.js. E.g. [install NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) and then run `nvm use` from repo root;
- yarn as a package manager. Just run 'yarn' in repo root;

After that is done:

- copy `.env.example` file to your local `.env` (make sure that it is not commited);
- (you may need to get some of the secrets to put in your .env)
- run docker-compose with DB and other dependencies: `yarn docker:up`
- start Back-End and Front-End locally: `yarn dev:all`
