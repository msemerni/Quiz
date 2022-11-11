FROM node:16
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
# ENV PORT 3000
# EXPOSE $PORT
CMD ["npm", "start"]
