package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func GetByBookId(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	bookId := vars["bookId"]

	fmt.Printf("received bookId: %s\n", bookId)
}
