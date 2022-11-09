
docker-compose up --build
docker-compose down -v
docker-compose up -d 

sudo lsof -iTCP:27017 -sTCP:LISTEN
sudo kill PID
sudo service mongod restart


ls /tmp/mongodb-27017*
lsof -i :27017



{title: "100+500", 
  answers: [{100: false},
           {200: false},
           {400: false},
           {600: true},
          ] }