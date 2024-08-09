Process:

check data
`docker exec -it dm3-db-1 redis-cli --scan --pattern 'session*addr.dm3.eth'`

`docker exec -it dm3-storage psql -U prisma -d dm3 -c 'SELECT * FROM "Account";'`

go into the redis container
docker exec -it dm3-db-1 bash

dump all relevant sessions
for key in `redis-cli --scan --pattern 'session*addr.dm3.eth'`; do echo $key: `redis-cli GET $key` >> dump.txt; echo $key; done

copy the dump to the host
docker cp dm3-db-1:/data/dump.txt .

copy the dump to the postgres container
docker cp dump.txt dm3-storage:/

paste script onto server
vi insertWithinDocker.sh
-> paste, close

copy the script to the postgres container
docker cp insertWithinDocker.sh dm3-storage:/

go into the postgres container
docker exec -it dm3-storage bash

make script executable
chmod a+x insertWithinDocker.sh

run the script
./insertWithinDocker.sh

check the data from outside the container
docker exec -it dm3-storage psql -U prisma -d dm3 -c 'SELECT \* FROM "Account";'
