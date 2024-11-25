FROM node:20

WORKDIR  /fredy

COPY . /fredy

RUN yarn install

RUN yarn global add pm2

RUN yarn run prod

RUN mkdir /db && \
  chown 1000:1000 /db && \
  chmod 777 -R /db/ && \
  ln -s /db /fredy/db

EXPOSE 9998

CMD pm2-runtime index.js
