# use node.js base image
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

COPY . .

EXPOSE ${PORT}

RUN chown -R node /usr/src/app
USER node
CMD ["node", "server.js"]
