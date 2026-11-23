# Contributing to CineMatch

First off, thank you for considering contributing to CineMatch! It's people like you that make open source such a great community.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check if there's already an issue for it. If not, open a new issue!

## Development Setup

1. Fork the repo and create your branch from `main`.
2. Setup the backend: `cd ai-engine && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
3. Setup the frontend: `cd frontend && npm install`
4. Make your changes.
5. Run the tests: `pytest` for backend, `npm run test` for frontend.
6. Lint your code: `flake8` for backend, `npm run lint` for frontend.
7. Issue a pull request!

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
