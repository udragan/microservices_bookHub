# use node.js base image
FROM node:lts-alpine
ENV NODE_ENV=production

# create app directory
WORKDIR /usr/src/app

# copy package.json and install dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

# copy the rest of app`s source code
COPY . .

# expose port
EXPOSE 8002

# start the app
RUN chown -R node /usr/src/app
USER node
CMD ["node", "server.js"]
