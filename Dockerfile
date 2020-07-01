FROM node:8.11.4

RUN mkdir -p /opt/coati_calendar
WORKDIR /opt/coati_calendar

COPY package.json /opt/coati_calendar/package.json

RUN npm i -g nodemon
RUN mkdir ./logs
COPY . /opt/coati_calendar

RUN npm i

COPY . /opt/coati_calendar

EXPOSE 3000