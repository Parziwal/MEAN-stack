# MEAN Stack

Az alkalmazás lényege, hogy a beregisztrált/bejelentkezett felhasználók posztolni tudnak az oldalon. A felhasználók látják egymás posztjait, de csak a sajátjukat tudják szerkeszteni, illetve törölni.

## Az alkalmazás futtatása:

1. Mongodb docker container futtatása:
   `docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME="admin" -e MONGO_INITDB_ROOT_PASSWORD="admin" mongo`
2. Az Express backend szerver futtatása:
   `npm run start:server`
3. Az Angular kliens alkalmazás futtatása:
   `ng serve`
