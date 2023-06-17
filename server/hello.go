package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"

	"github.com/gin-gonic/gin"
)

func ReverseProxy(host string, path string, query string) gin.HandlerFunc {
	return func(c *gin.Context) {
		director := func(req *http.Request) {
			//r := c.Request

			fmt.Println("BEFORE:" + req.URL.String())

			req.URL.Scheme = "http"
			req.URL.Host = host
			req.URL.Path = path + c.Param("url")
			req.URL.RawQuery = query
			fmt.Println("AFTER:" + req.URL.String())
			//req.Header["my-header"] = []string{r.Header.Get("my-header")}
			// Golang camelcases headers
			//delete(req.Header, "My-Header")
		}
		proxy := &httputil.ReverseProxy{Director: director}
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

func main() {
	router := gin.Default()
	//router.SetTrustedProxies(nil)
	router.GET("/", ReverseProxy("web-ui:1234", "/", ""))
	router.GET("/:url", ReverseProxy("web-ui:1234", "/", ""))

	router.GET("/terminal", ReverseProxy("ttyd:7681", "/", ""))
	router.GET("/terminal/:url", ReverseProxy("ttyd:7681", "/", ""))
	router.GET("/terminal/ws", ReverseProxy("ttyd:7681", "/ws", "arg=1000&arg=1000&arg=bash"))

	router.Run(":8080")
}
