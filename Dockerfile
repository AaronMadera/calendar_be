FROM node:12.18.2

RUN mkdir -p /opt/coati_calendar
WORKDIR /opt/coati_calendar

COPY package.json /opt/coati_calendar/package.json

RUN npm i -g nodemon npm
RUN mkdir ./logs
COPY . /opt/coati_calendar

RUN npm i

COPY . /opt/coati_calendar

EXPOSE 3000