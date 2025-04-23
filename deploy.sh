#!/bin/bash

# Pull the latest code
git pull origin main

# Install dependencies
npm install

# Restart the services
./restart.sh 