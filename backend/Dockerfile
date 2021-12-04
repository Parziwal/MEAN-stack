FROM node

# A wait-for.sh szkirpt futtatásához szükséges csomag telepítése

RUN apt-get -q update && apt-get -qy install netcat

# A backend függőségeinek telepítése

WORKDIR /backend

COPY package*.json ./

RUN npm install

EXPOSE 3000