# Calendar_BE

backend for calendar project API
------------------------------------------------------------------------------
*   Requirements:
    Install docker by following the next stpes for your OS:
    https://docs.docker.com/install/

*   And docker-compose by following steps in here:
    https://github.com/Yelp/docker-compose/blob/master/docs/install.md

*   **Note**: docker compose is not supported in Windows yet.

*   extract file `mongodb-docker-image.zip` in your home directory (or other desired directory),
    open terminal in container folder of the extracted `docker-compose.yml`, and run:
    ```
    $ docker-compose up
    ```
    And now you already have mongodb docker image running in your computer.
    With the network `mongodb_network`.
------------------------------------------------------------------------------
## Useful Commands
*   for building (if you don't have docker-compose):
    ```
    $ docker build -t <Container_Name> .
    ```

*   for attaching to the console :
    ```
    $ docker run -it <Container_Name> /bin/bash
    ```

*   for running with docker (if you don't have docker-compose):
    ```
    $ docker run -it --publish 3000:3000 <Container_Name>
    ```

*   press `ctrl` and `c` keys at the same time to exit docker process.

## Instructions
*   Build this docker image with (inside this main folder)
    ```
    $ docker-compose build
    ```

*   Please, run seeder to have at least 2 users to work with. These also are needed for testing purpose.
    ```
    $ npm run seeder
    ```
    this could be done inside docker if you want (read above how to attach shell)

*   Up this docker image with (inside this main folder)
    ```
    $ docker-compose up
    ```
