#!/bin/bash

# Start nginx service
sudo systemctl start nginx.service

# Start the application in the background
node ./dist/app.js & 