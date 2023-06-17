FROM golang:1.20 as server
WORKDIR /build
COPY ./server/go.mod ./server/go.sum .
RUN go mod download && go mod verify
COPY ./server .
RUN go build -v -o /build/app .

FROM node:18.16.0 as web-ui
WORKDIR /build
COPY ./web-ui/package.json ./web-ui/yarn.lock .
RUN yarn install --frozen-lockfile
COPY ./web-ui .
RUN yarn build

#FROM alpine:3.18.2
#WORKDIR /app
#COPY --from=server /build/app/ .
#COPY --from=web-ui /build/dist/ ./web-ui
