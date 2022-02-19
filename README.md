# CSCI 467 : Vue Example Projects
Interact with live web apps created as examples for the CSCI 467 projects A and B. The source code, from [github.com/RaimundEge/vue-example-projects](https://github.com/RaimundEge/vue-example-projects/), is written in [Vue.js](https://vuejs.org/) and [Express.js](https://expressjs.com/), and is running in docker containers created by [@chigeek](https://github.com/chigeekgreg).

[![Screenshot](/thumbnail.png?raw=true "Screenshot")](https://vue-example-projects.chigeek.xyz/)

**Live demo** at [https://vue-example-projects.chigeek.xyz/](https://vue-example-projects.chigeek.xyz/)

<details>
  <summary>Credentials for quotes app</summary>
  
  | Username | Password |
  |----------|----------|
  | alice    | alice    |
  | bob      | bob      |
  | charlie  | charlie  |
</details>

## Run the project using docker-compose
This repository includes two options for running using docker-compose.

<details>
  <summary>1. Run apps in <strong>standalone mode</strong> with a dumped legacy database.</summary>
  
  ⚠️ *This option is best for local development and works even when `blitz` is offline.*

  ```sh
    docker-compose up -d
  ```

  This default method will use the configuration from `docker-compose.yml` and `docker-compose.override.yml`. The override .yml file includes a definition for an additional mariadb instance that will simulate the live legacy database, including dynamically changing the name of customer with id=33. Also, the product images are served directly from nginx under /pics/.
</details>

<details>
  <summary>2. Run app in <strong>production mode</strong> with a connection to the live legacy database and pictures directory on `blitz`</summary>
  
  ⚠️ *This option requires http and mysql on blitz to be accessible from your machine.*

  ```sh
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  ```

  This default method will use the configuration from `docker-compose.yml` and `docker-compose.prod.yml`. The prod .yml file includes a config file for the backends to connect to the live database. Also, the product images are proxied from `blitz` through nginx under `/pics/`, with a cache volume mapped to `/data/nginx/cache` so that images are not retrieved from `blitz` more than once.
</details>

Both options will run both the frontend and backend for both the product and quotes apps, exposed via single web service on the port configured in the `.env` file, 8001 by default. The backends, running on ports 3000 and 3001 are proxied through nginx and not directly exposed. You do not need to manually set up any servers or edit any configuration files using this method.

## Run the project using node on your local machine
You can run these projects directly with node, without docker and docker-compose.

1. Create a MySQL/MariaDB database somewhere, and import the data from /{product,quote}/{seed,sql}/*
2. Edit the configuration files at /{product,quote}/REST/config.json to point to your database instance.
3. Start each frontend and backend separately. Change directory int the REST directory and run `node app.js`
4. Open each `Vue/*.html` file in your browser.