package main

import (
	"embed"
	"net/http"
	"net/url"
)

//go:embed all:fs
var content embed.FS

func AddPrefix(prefix string, h http.Handler) http.Handler {
	if prefix == "" {
		return h
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := prefix + r.URL.Path
		rp := prefix + r.URL.RawPath
		r2 := new(http.Request)
		*r2 = *r
		r2.URL = new(url.URL)
		*r2.URL = *r.URL
		r2.URL.Path = p
		r2.URL.RawPath = rp
		h.ServeHTTP(w, r2)
	})
}

func main() {
	// static files from the "fs" directory
	http.Handle("/homepie/", http.StripPrefix("/homepie", AddPrefix("/fs", http.FileServer(http.FS(content)))))

	http.HandleFunc("/", ReverseProxy("http://web-ui:1234/", "/").ServeHTTP)
	http.HandleFunc("/terminal", ReverseProxy("http://ttyd:7681/", "/terminal").ServeHTTP)
	http.HandleFunc("/terminal/ws", ReverseProxy("http://ttyd:7681/?arg=root&arg=/bin/bash", "/terminal").ServeHTTP)

	http.ListenAndServe(":8080", nil)
}
