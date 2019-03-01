# React Apollo Django boilerplate

Boilerplate that using apollo-subscriptions and django-channels

## Getting Started

- Rename ".env.example" to ".env"

```bash
mv .env.example .env
```

- Build docker containers

```bash
docker-compose build
```

- Create database

```bash
docker-compose up -d database
```

- Make database migrations

```bash
docker-compose run server python manage.py migrate
```

- Install dependencies for client

```bash
docker-compose run client yarn
```

- Run the project

```bash
docker-compose up
```

## Usage

After you run the project open in your browser:

- Frontend: http://localhost:3000/
- Backend: http://localhost:8000/

## Contributing

Please use Prettier and ESLint for writing code, and the process for submitting pull requests to us

## Code of Conduct

By participating in this project you agree to abide by its terms

## License

This project is licensed under the MIT License
