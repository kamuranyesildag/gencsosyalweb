npm run dev > server_output.log 2>&1 &
SERVER_PID=$!
sleep 5

curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/projects
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/feed
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/users/imran
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/v1/users/me -X PATCH

kill $SERVER_PID
