package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

type bodyWithInjected struct {
	io.ReadCloser
	injected []byte
	//skipBytes    int
	readBytes    int
	thenFailWith error
}

func (r *bodyWithInjected) Read(p []byte) (n int, err error) {
	//if r.skipBytes > 0 {
	//	count := len(p)
	//	if count > r.skipBytes {
	//		count = r.skipBytes
	//	}
	//
	//	n, err := r.ReadCloser.Read(p[0:count])
	//	r.skipBytes -= n
	//	return n, err
	//}

	remaining := len(r.injected) - r.readBytes
	if remaining > 0 {
		count := len(p)
		if count > remaining {
			count = remaining
		}

		index := r.readBytes
		r.readBytes += count
		return copy(p, r.injected[index:index+count]), nil
	}

	if r.thenFailWith != nil {
		err := r.thenFailWith
		r.thenFailWith = nil
		return 0, err
	}

	return r.ReadCloser.Read(p)
}

// Keep reading until the buffer is full or an error occurs.
func readFull(r io.Reader, buff []byte) (n int, err error) {
	index := 0
	for {
		if index >= len(buff) {
			break
		}

		//fmt.Printf("reading, index: %v, len: %v\n", index, len(buff))
		n, err := r.Read(buff[index:])
		//fmt.Printf("n: %v, err: %v\n", n, err)

		index += n

		if err != nil {
			break
		}
	}

	return index, err
}

func ReverseProxy(target string, base string) http.Handler {
	targetUrl, err := url.Parse(target)
	if err != nil {
		panic(err)
	}

	baseUrl, err := url.Parse(base)
	if err != nil {
		panic(err)
	}

	injectCode := []byte("<script src=\"" + ("/homepie/sdk.js") + "\"></script>")

	return &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetURL(targetUrl)

			if baseUrl.Host != "" {
				r.Out.Host = baseUrl.Host
			} else {
				r.Out.Host = r.In.Host
			}

			r.Out.URL.Path = "/" + r.Out.URL.Path[len(baseUrl.Path):]
			if strings.HasPrefix(r.Out.URL.Path, "//") {
				r.Out.URL.Path = r.Out.URL.Path[1:]
			}

			if targetUrl.RawQuery != "" {
				r.Out.URL.RawQuery = targetUrl.RawQuery
			}

			// The body might be altered, disable compression.
			r.Out.Header.Del("Accept-Encoding")

			//fmt.Printf("'%v' => '%v'\n", r.In.URL, r.Out.URL)
		},
		ModifyResponse: func(r *http.Response) error {
			// If the response content type is HTML, inject script
			if strings.Contains(r.Header.Get("Content-Type"), "text/html") {
				// Set the Content-Length header based on the modified response body
				if r.ContentLength != -1 {
					r.ContentLength += int64(len(injectCode))
					r.Header.Set("Content-Length", fmt.Sprint(r.ContentLength))
				}

				if r.Request.Method != "HEAD" {
					//b, err := ioutil.ReadAll(r.Body)
					//fmt.Printf("TEST n %v, err: %v\n", b, err)

					buff := make([]byte, 1024)
					buffLen, err := readFull(r.Body, buff)
					//fmt.Printf("aaa %v\n", buffLen)

					// Inject SDK inside <head>, otherwise inside <html>, otherwise after the <!DOCTYPE>, otherwise at the start.
					injectAtIndex := 0

					// TODO: do not convert to string, use raw bytes (this will prevent encoding issues as well).
					buffAsStr := string(buff)
					if injectAtIndex == 0 {
						start := strings.Index(buffAsStr, "<head")
						if start != -1 {
							end := strings.Index(buffAsStr[start:], ">")
							if end != -1 {
								injectAtIndex = start + end + 1
							}
						}
					}
					if injectAtIndex == 0 {
						start := strings.Index(buffAsStr, "<html")
						if start != -1 {
							end := strings.Index(buffAsStr[start:], ">")
							if end != -1 {
								injectAtIndex = start + end + 1
							}
						}
					}
					if injectAtIndex == 0 {
						start := strings.Index(buffAsStr, "<!DOCTYPE")
						if start != -1 {
							end := strings.Index(buffAsStr[start:], ">")
							if end != -1 {
								injectAtIndex = start + end + 1
							}
						}
					}

					injected := append(buff[0:injectAtIndex+len(injectCode)], buff[injectAtIndex:]...)
					copy(injected[injectAtIndex:], injectCode)
					injected = injected[0 : buffLen+len(injectCode)]

					r.Body = &bodyWithInjected{
						ReadCloser:   r.Body,
						injected:     injected,
						thenFailWith: err,
					}
				}
			}

			return nil
		},
	}
}
