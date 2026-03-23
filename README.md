# Artilens

A Personal Website Template.

![website template](./website_template.webp)

## Development Environment

1. Clone the repo.

```shell
mkdir my_website && cd ./my_website
git clone https://github.com/artixzhang/Artilens.git && cd Artilens
```

2. Create the `data/` directory for the static assets, with the template. 

```shell
cp -r data_template ../data # A data dir name can be chosen
```

3. Create the `.env` file.

```shell
cat <<EOF > .env
DATA_PATH=../data # Use the dir set above
JWT_SECRET= # Set a RANDOM secret key for user system
EOF
```

4. Start the node & vite service with 2 terminal windows.

```shell
npm install
npm run dev
```

```shell
node server/index.js
```

5. Visit [http://localhost:5555](http://localhost:5555) on the browser.

6. Click "Avatar icon on the navigation bar" -> "Log in" to create the admin account.

7. Customize the files laid below

- `info.yaml`
- `navbar.yaml`
- `profile.yaml`


## Deploy To Server

1. Create a directory for the website:

```shell
mkdir my_website && mkdir -p my_website/Artilens && cd ./my_website
```

2. Copy the data folder to `./my_website/`.

3. Clone the `.env` file to `./my_website/Artilens`, and check the data directory.

4. Clone the `docker-compose.yml` file to `./my_website/Artilens`.

5. Run the command below under `./my_website/Artilens`.

```shell
docker compose up -d
```
