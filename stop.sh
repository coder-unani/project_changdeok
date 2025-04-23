#!/bin/bash

# Stop nginx service
sudo systemctl stop nginx.service

# Find and kill the node process
pkill -f "node /dist/app.js" 