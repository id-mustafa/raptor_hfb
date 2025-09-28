### RexBets

Crazy good bets (in real time high frequency format)

### For frontend folks:

Here is how to work with the new project. As you can see, we have packaged the frontend and backend into a cohesive monolith using a docker container. You know should have access to the application and the same ports.

You can see which ports are allocated for backend and frontend at the [Caddyfile](./Caddyfile) reverse proxy setup.

To run the frontend and the backend, you may just run the command "honcho start."

To view the Swagger documentation of our backend endpoints, just run the project with "honcho start" and then append "/docs" to the localhost url...i.e. (localhost:4402/docs) should point you to our swagger documented APIs for you to interact with.

Alot of these APIs have been created so feel free to code-surf to gain understanding until we meet again.