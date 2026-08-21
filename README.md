# Astroflow Service Status monitoring page

This is the Astroflow service status monitoring page. Unlike the previous FastAPI-based version, this is a static page using only HTML/CSS/JavaScript to ping the `/health` endpoints of the respective Astroflow services.

Code lives in `/static`, with the application logic in `static/script.js`