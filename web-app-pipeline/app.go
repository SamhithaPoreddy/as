package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
)

var templates = template.Must(template.ParseFiles("project-file-converter.html", "index.html", "about.html", "contact.html", "designer.html"))

func index(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		templates.ExecuteTemplate(w, "index.html", "")
	}
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		templates.ExecuteTemplate(w, "about.html", "")
	}
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		templates.ExecuteTemplate(w, "contact.html", "")
	}
}

func devHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		templates.ExecuteTemplate(w, "designer.html", "")
	}
}

func projectHandler(w http.ResponseWriter, r *http.Request) {
	/* get query params */
	param := r.URL.Query().Get("task")
	if param != "" {
		fmt.Println(param)
	}

	if r.Method == "GET" {
		templates.ExecuteTemplate(w, "project-file-converter.html", "")
	} else if r.Method == "POST" {

		/* iterate through the files, and store the files in the /test dir */
		err := r.ParseMultipartForm(100000)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		//get a ref to the parsed multipart form
		m := r.MultipartForm

		//get the *fileheaders
		files := m.File["uploadfile"]
		r.ParseForm()
		filetype := r.FormValue("target")
		fmt.Println("target file type:", filetype)
		for i, _ := range files {
			//for each fileheader, get a handle to the actual file
			file, err := files[i].Open()
			defer file.Close()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			//create destination file making sure the path is writeable.
			dst, err := os.Create("test/" + files[i].Filename)
			fmt.Println("File", i+1, files[i].Filename)
			defer dst.Close()
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			//copy the uploaded file to the destination file
			if _, err := io.Copy(dst, file); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		templates.ExecuteTemplate(w, "project-file-converter.html", "upload successful")
	}
}

func devPostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		r.ParseForm()
		nodes := r.FormValue("nodes")
		vpcs := r.FormValue("vpc")
		fmt.Println(nodes)
		fmt.Println(vpcs)
	}
}

func main() {
	// different handlers
	http.HandleFunc("/", index)
	http.HandleFunc("/project-file-converter", projectHandler)
	http.HandleFunc("/about", aboutHandler)
	http.HandleFunc("/contact", contactHandler)
	http.HandleFunc("/devtest", devHandler)
	http.HandleFunc("/devtest/post", devPostHandler)

	// get the required js, css and images
	http.Handle("/vendor/", http.StripPrefix("/vendor/", http.FileServer(http.Dir("vendor"))))
	http.Handle("/img/", http.StripPrefix("/img/", http.FileServer(http.Dir("img"))))
	http.Handle("/jsplumb-js/", http.StripPrefix("/jsplumb-js/", http.FileServer(http.Dir("jsplumb-js"))))
	http.Handle("/jsplumb-css/", http.StripPrefix("/jsplumb-css/", http.FileServer(http.Dir("jsplumb-css"))))
	http.Handle("/projects/", http.StripPrefix("/projects/", http.FileServer(http.Dir("projects"))))

	fmt.Println("Preparing to listen and serve on port 8888")
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
