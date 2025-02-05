ARG VERSION=stable
ARG DEBIAN_FRONTEND=noninteractive

FROM debian:stable-slim AS builder

ENV NODE_VERSION=node_20.x
ENV NODE_KEYRING=/usr/share/keyrings/nodesource.gpg
ENV DISTRIBUTION=bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg

RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee "$NODE_KEYRING" >/dev/null && \
    echo "deb [signed-by=$NODE_KEYRING] https://deb.nodesource.com/$NODE_VERSION $DISTRIBUTION main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY . /source
WORKDIR /source

RUN npm install && npm run build

FROM registry.community.greenbone.net/community/gsad:${VERSION}

COPY --from=builder /source/build /usr/local/share/gvm/gsad/web/
