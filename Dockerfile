# Copyright 2021 Google LLC
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#      http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Use the official lightweight Node.js image.
# https://hub.docker.com/_/node
FROM node:18.15.0-alpine

# Create and change to the app directory.
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm ci


# Build the project.
RUN npm run build

# Copy local code to the container image.
COPY . ./

EXPOSE 3005

CMD ["node", "dist/main.js"]


# # Pass secrets as build-time arguments
# ARG NODE_ENV
# ARG MONGODB_URI
# ARG MONGO_DATABASE
# ARG GOOGLE_CLIENT_ID
# ARG GOOGLE_SECRET
# ARG GOOGLE_CALLBACK_URL
# ARG JWT_SECRET
# ARG JWT_SECRET_EXPIRY_SECONDS
# ARG CLIENT_URL
# ARG CLIENT_HOST

# ENV NODE_ENV=$NODE_ENV
# ENV MONGODB_URI=$MONGODB_URI
# ENV MONGO_DATABASE=$MONGO_DATABASE
# ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
# ENV GOOGLE_SECRET=$GOOGLE_SECRET
# ENV GOOGLE_CALLBACK_URL=$GOOGLE_CALLBACK_URL
# ENV JWT_SECRET=$JWT_SECRET
# ENV JWT_SECRET_EXPIRY_SECONDS=$JWT_SECRET_EXPIRY_SECONDS
# ENV CLIENT_URL=$CLIENT_URL
# ENV CLIENT_HOST=$CLIENT_HOST


