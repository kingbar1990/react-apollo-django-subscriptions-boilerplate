## How to start?

### Install dependencies

### Build project

1. Rename ".env.example" to ".env"
```bash
mv .env.example .env
```

2. Build docker-compose
```bash
docker-compose build
```

3. Create database
```bash
docker-compose up -d database
```

4. Make database migrations
```bash
docker-compose run server python manage.py migrate
```

5. Create mode_modules
```bash
docker-compose run client yarn
```

6. Run the project
```bash
docker-compose up
```

9. Open in your browser
  Frontend:
  http://localhost:3000/
  Backend:
  http://localhost:8000/
