# Calendar_BE

backend for calendar project API
------------------------------------------------------------------------------
*   Requirements:
    Install docker by following the next stpes for your OS:
    https://docs.docker.com/install/

*   And docker-compose by following steps in here:
    https://github.com/Yelp/docker-compose/blob/master/docs/install.md

*   **Note**: docker compose is not supported in Windows yet.
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
    $ docker run -it --publish 4077:4077 <Container_Name>
    ```

*   press `ctrl` and `c` keys at the same time to exit docker process.