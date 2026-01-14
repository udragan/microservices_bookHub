#  build stage
FROM elixir:1.19-otp-28 AS build

RUN apt-get update -y && apt-get install -y build-essential git && \
    apt-get clean && rm -f /var/lib/apt/lists/*_*
RUN mix local.hex --force && mix local.rebar --force

WORKDIR /app
ENV MIX_ENV=prod

COPY app/mix.exs app/mix.lock ./
RUN mix deps.get --only prod
RUN mix deps.compile

COPY app/config config
COPY app/lib lib

RUN mix compile
RUN mix release

# run stage
FROM debian:trixie-slim AS runtime

RUN apt-get update -y && \
    apt-get install -y libstdc++6 openssl libncurses6 locales ca-certificates && \
    apt-get clean && rm -f /var/lib/apt/lists/*_*
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

WORKDIR /app
ENV MIX_ENV=prod
COPY --from=build /app/_build/prod/rel/health_monitor_service ./

CMD ["bin/health_monitor_service", "start"]
