# Cryton Frontend

Frontend implementation of the Cryton toolset.

## Dependencies

Data for components is fetched from the cryton core REST API running
on your machine.

*  Cryton Core
*  npm

## Configuration

App expects the Cryton REST api to run on _localhost:8000_ by default. You can change this setting in the environment file located in **src/environments**. For production build, modify the _environment.prod.ts_ file, else modify the _environment.ts_ file.

In the environment file set the **crytonRESTApiHost** and **crytonRESTApiPort** according to your REST api's host and port.

## Installation

1.  Clone this repository and cd into it.
2.  Run `npm install`, npm will take care of installing all of the dependencies.
3.  Make sure your **Cryton Core** is running, otherwise no data will be available for the app.
4.  Based on your needs you can:
    - Serve the app by running `ng serve` or `ng serve --prod` for production.
        - App wil now be available on **localhost:4200**
    - Build the app by running `npm run build` or `npm run build-prod` for production.
        - You can find the build in the **/dist** folder.

## Docker

You can also run the application with docker by using `docker-compose up`. Docker will automatically build the app for production with minimal dependencies and deploy it on an Nginx server inside the container. The default port is set to **8080**, you can change this setting in the docker-compose.yml.

## Development

- App uses husky to run pre-commit hooks. These include:
    - Code formatting with Prettier.
    - Linting with ESLint.
    - Running unit tests with Karma.
- To start development:
    1. Install dependencies with `npm install`.
    2. Run `npm start` to run the development server. The app will now listen for changes and refresh itself on every change in the project's filesystem.
