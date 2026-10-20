
FROM denoland/deno:latest

WORKDIR /app

COPY deno.json deno.lock ./
RUN deno install

COPY . .

ENV PORT=8000

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]
