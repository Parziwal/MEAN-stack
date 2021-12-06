# MEAN Stack

Az alkalmazás lényege, hogy a bejelentkezett felhasználók posztolni tudnak az oldalon. A felhasználók látják egymás posztjait, de csak a sajátjukat tudják szerkeszteni, illetve törölni.

![Fontend tests](https://github.com/Parziwal/MEAN-stack/actions/workflows/backend.yml/badge.svg)
![Backend tests](https://github.com/Parziwal/MEAN-stack/actions/workflows/node.js.yml/badge.svg)

## Az alkalmazás futtatása:

1. Mongodb docker container futtatása:
   `docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME="admin" -e MONGO_INITDB_ROOT_PASSWORD="admin" mongo`
2. Az Express backend szerver futtatása:
   `npm run start:server`
3. Az Angular kliens alkalmazás futtatása:
   `ng serve`

## Architektúra:

Az alkalmazás a három rétegű architektúrát követi:

- **Angular kliens**: Az Angular a Google által fejlesztett TypeScript alapú ingyenes és nyílt forráskódú webalkalmazás keretrendszer single-page alkalmazások fejlesztéséhez. 
- **Express szerver oldal**: Az Express egy Node.js alapú keretrendszere, amely ingyenes és nyílt forráskódú. Webes alkalmazások és API-k kiépítésére tervezték.
- **MongoDB adatbázis**: A MongoDB nyílt forráskódú dokumentumorientált adatbázis szoftver, amelyet a NoSQL adatbázisszerverek közé tartozik.

## GitHub CI

- Az alkalmazáshoz két Github workflow készült:
  - **Backend tesztelésre**
  - **Frontend tesztelésre**

- Mind a két pipeline a legfrissebb ubuntu image-et használja és ugyanaz a két parancs van bennük kiadva: `npm ci` és `npm run test`, utóbbi esetlegesen pár opcióval
- A teszteléshez tartozó parancs a backenden erre oldódik fel:
`mocha tests/**/*.js --reporter mocha-junit-reporter`
- A projekt konfigurációja miatt a két parancs következtében JUnit formátumú XML fájlokként teszt reportok készülnek, ezt pedig a workflow publikálja

## Docker:

A docker konténerek összeállításánál az alábbi elemeket használtuk:

- Az Angular alkalmazás lefordításából keletkező statikus fájlok kiszolgálásához az **nginx** webszervert használtuk.
- Az Express szerver oldal futtatásához a **node** docker konténert készítettünk.
- Az alkalmazás adatainak tárolásához a **mongo** docker konténert alkalmaztunk.

### A szerver oldali docker konténer

```yaml
node-backend:
   build:
     context: ./backend
     dockerfile: Dockerfile
   image: nodejs
   restart: unless-stopped
   networks:
     - app-network
   env_file:
     - .env
   environment:
     MONGO_HOSTNAME: mongodb
   volumes:
     - ./backend:/backend
     - node_modules:/backend/node_modules
   ports:
     - 3000:3000
   command: ./wait-for.sh mongodb:27017 -- node server.js
```

- `build`: Ez határozza meg a konfigurációs beállításokat, vagyis a dockerfájlt, amely alapján a Compose létrehoz egy node image fájlt a szerver oldal telepített függőségeivel, és ez alapján a docker konténert.
- `image`: Az image fájlnak állít be egy egyedi nevet.
- `restart`: Ez határozza meg az újraindítási szabályt. Az alapértelmezés `no`, de a konténert úgy állítottuk be, hogy újrainduljon, hacsak nem állítják le.
- `network`: Ez specifikálja, hogy a szolgáltatásunk az `app-network` hálózatra fog csatlakozni.
- `env_file`: Ez azt jelzi a Compose-nak, hogy környezeti változókat szeretnénk hozzáadni egy .env nevű fájlból.
- `MONGO_HOSTNAME`: A `mongodb` konténere történő hivatkozás beállítása, ami a szerver oldal adatbázishoz való csatlakozásában játszik szerepet. A további kapcsolati beállítások a `.env` fájlban találhatók.
- `volume`: Két típusú kötet van:
   - Az első egy `bind mount`, amely a gazdagépen lévő alkalmazás kódunkat a konténer `/backend` könyvtárához csatolja. Ez megkönnyíti a gyors fejlesztést, mivel a gazdagép kódjában végzett minden módosítás azonnal megjelenik a konténerben.
   - A második egy úgynevezett `named volume`, `node_modules`. Amikor a Docker futtatja a szerver oldalhoz tartozó dokerfájlban található `npm install` parancsot, az npm egy új `node_modules` könyvtárat hoz létre a konténerben, amely tartalmazza az alkalmazás futtatásához szükséges csomagokat. Ha azonban a `node_modules` könyvtár a gazdagépen üres, akkor ez felülírja a konténerben lévő `node_modules` könyvtár tartalmát is, ami megakadályozza az alkalmazás elindítását. A `node_modules` `named volume` típusú kötés megoldja ezt a problémát, megőrizve a `/backend/node_modules` könyvtár tartalmát.
- `ports`: Ez leképezi a gazdagép 3000-es portját a tároló 3000-es portjára.
- `command`: Ezzel a beállítással azt a parancsot lehet megadni, ami akkor kerül végrehajtásra, amikor a Compose futtatja az image fájlt. Itt az alkalmazást a `wait-for.sh` parancsfájl használatával futtatjuk, amely lekérdezi a mongodb szolgáltatást a 27017-es porton keresztül, hogy tesztelje, hogy az adatbázis szolgáltatás készen áll-e már a csatlakozásra. Amint az adatbázis elérhetővé válik a szkript végrehajtja az általunk beállított parancsot, hogy elindítsa a szerver oldalt.

### Az adatbázis docker konténer

```yaml
mongodb:
   image: mongo
   restart: unless-stopped
   networks:
   - app-network
   env_file:
   - .env
   environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
   volumes:
   - dbdata:/data/db
   ports:
   - 27017:27017
```

Néhány beállítás megegyezik az előző `node-backend` esetében definiált szolgáltatással, de vannak újak is, mint:

- `image`: A szolgáltatás létrehozásához a Compose lekéri mongo image fájlt a Docker Hubról.
- `MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD`: Ezen környezeti változók együtt hoznak létre egy `root` felhasználót az `admin` adatbázisban, és gondoskodik arról, hogy a hitelesítés engedélyezve legyen a konténer indulásakor.
- `dbdata:/data/db`: A `dbdata` `named volume` típusú kötetbe kerülnek eltárolásra a Mongo konténerben lévő adatok. Ez biztosítja, hogy ne vesszenek el az adatok, amikor a konténer leállításra vagy eltávolításra kerül.

### A kliens docker konténer

```yaml
angular-frontend:
   build:
     context: .
     dockerfile: Dockerfile
   image: angular
   restart: unless-stopped
   networks:
     - app-network
   environment:
     NODE_BACKEND_HOSTNAME: node-backend
   ports:
     - 80:80
```

A beállítások nagy része megegyezik az előző esetekkel, a különbség:

- `build`: A kliens oldalhoz tartozó dokerfájl beállítása, amely telepíti az alkalmazás függőségeit, majd lefordítja azt, és a Compose által létrehozott image fájl a lefordított alkalmazást tartalmazza, ami alapján a doker konténert is létrehozza.
- `NODE_BACKEND_HOSTNAME`: A `node-backend` konténere történő hivatkozás beállítása, ami alapján a kliens kéréseket intézhet a szerver felé.

## Tesztek

A szerver és a kliens oldal esetében is unit teszteket és ui teszteket készítettünk az alkalmazás egyes funkcióinak ellenőrzéséhez.

### Szerver oldali tesztek

A szerver oldal esetében a posztok kezelését végző funkciókat teszteltük le `mocha` és `chai` tesztelési keretrendszerek segítségével.

Az `postController` alábbi metódusait teszteltük le:

- A `getPost`, ami egy megadott azonosítójú posztot kér le.
- A `createPost`, ami az aktuális felhasználóhoz egy paraméterként megadott posztot hoz létre az adatbázisban.
- A `updatePost`, ami a poszt és az aktuális felhasználó azonosítója alapján talált bejegyzést frissíti a paraméterként megadott adatokkal.
- A `deletePost`, ami a poszt és az aktuális felhasználó azonosítója alapján törli a bejegyzést az adatbázisból.

### Kliens oldali tesztek

A kliens oldalon a posztok lekérését végző szolgáltatás és a posztokat kilistázó komponensekre készítettünk teszteket `jasmine` és `karma` tesztelési keretrendszerek alkalmazásával.

Az `PostsService` szolgáltatás alábbi metódusait teszteltük:

- `getPost`, ami lekéri a megadott azonosítójú bejegyzést.
- `addPost`, ami a bejegyzés címe, tartalma és egy kép alapján létrehoz egy bejegyzést, és a felhasználót visszanavigálja a főoldalra.
- `deletePost`, ami a megadott azonosítójú bejegyzést törli.

A `PostListComponent` komponensben tesztelt részek:

- A komponens létrejön a megadott beállításokkal.
- A komponens a betöltése során lekéri és elmenti a posztokat, valamint beállítja az oldalszámot is.
- A lekért poszt meg is jelenik a komponenshez tartozó nézetben.
- Egy poszt esetén a törlés gombra kattintva a `PostsService` szolgáltatás `deletePost` metódusa kerül meghívásra.

## Jenkins

A Jenkins szerver a BME Cloudban lévő DevOps CI VM-en fut

A virtuális gép 80-as portja ki mappelve, hogy bárki el tudja érni az alkalmazást.

A build folyamat beállításai az alábbiak
  - Lehúzza a GitHub repository legújabb verziójának 'main' branchét
  - 30 percentként ellenőrzi, hogy történt-e változtatás és ha igen, akkor újra lefut
  - Leállítja a futó docker konténereket és a docker imageket eltávolítja
  - Egy külön Jenkins plugint használva lefuttatja a 'docker-compose up' parancsot néhány hozzáadott opcióval
