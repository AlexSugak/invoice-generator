# Invoice Generator

An simple web app that can be used to generate invoice PDFs. Users can edit invoice content: line items, company names, addresses, TAXes and total costs etc. using simple interface. Users can also optionally authenticate and save invoice templates for later use

## Architecture

- UI: nextjs app, TypeSript, Tailwind CSS;
- Backend: nest.js JSON over http API;
- Storate: Postgresql DB
- Deployment: docker-compose running in VM
- Monitoring: logs and error reports via Sentry 
