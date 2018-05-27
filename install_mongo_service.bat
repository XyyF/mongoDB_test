set dbPath="F:\tools\mongodb"

cd /d %dbPath%
mkdir data
mkdir logs
cd bin
mongod -




-dbpath=%dbPath%\data --logpath=%dbPath%\logs\mongodb.log -port 25916 --serviceName MongoDB --install
net start MongoDB