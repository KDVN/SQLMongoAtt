FROM node:boron
ARG MOUNT_DIR
ARG NPM_SCRIPT
ARG EXTRA_RUN

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./$MOUNT_DIR/package.json ./
RUN npm install --silent --progress=false
RUN $EXTRA_RUN

# Bundle
COPY ./$MOUNT_DIR ./

EXPOSE 3000
CMD ["npm", "run", "start"]
