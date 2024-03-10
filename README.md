# kitchenwise-backend

Backend for our revolutionary voice-based kitchen management platform.

## Architecture

- Node.js/Express
- MongoDB + Mongoose
- Python receipt scanning submodule

## Prerequisites

- Nodejs
- MongoDB database (local or remote)

## Setup

1. Install packages with `yarn`
2. Add a .env file with the following vars:
   - `DATABASE_URL=<your Mongo URI here>`
   - `SPOONACULAR_API_KEY=<your Spoonacular key here>`
   - `OPENAI_API_KEY = <your OpenAI API key here>`
3. Run `npm start`

## Deployment

We have a Render app set up that continuously deploys from Github.

## Authors

Stefel Smith <br>
Syed Hussaini <br>
Victor Sanni <br>
Julian George <br>
Brian Zhang

## Acknowledgments

We use Spoonacular's API for food tagging.
