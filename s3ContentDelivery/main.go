package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)
func main(){
    
     const BUCKET_URL="https://swarnnika-vercel2.s3.amazonaws.com/__output"

	 proxy := httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "https", Host: BUCKET_URL})

	proxy.Director = func(req *http.Request) {
		req.Host = strings.Split(req.Host, ".")[1]
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			r.URL.Path = "/index.html"
		}

		proxy.ServeHTTP(w, r)
	})
	 fmt.Println("Server is running on port 8080")
   
	
	 port:=8080
	fmt.Printf("Starting server on port %d...\n", port)
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}