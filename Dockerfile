FROM node:10.14.2
# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app

RUN npm install

# Bundle app source
COPY . /app

RUN npm run build

RUN chmod +x ./dist/cron.js
RUN chmod +x ./dist/export.js

CMD ["npm", "run", "prodstart"]
