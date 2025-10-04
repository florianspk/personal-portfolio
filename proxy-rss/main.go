package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/mmcdole/gofeed"
)

type RSSItem struct {
	Title       string   `json:"title"`
	Tags        []string `json:"tags"`
	Image       string   `json:"image"`
	Link        string   `json:"link"`
	Date        string   `json:"date"`
	Description string   `json:"description"`
}

func main() {
	_ = godotenv.Load()

	blogBaseURL := os.Getenv("RSS_FEED_URL")
	if blogBaseURL == "" {
		blogBaseURL = "http://wheezy-blog.wheezy-blog"
	}

	// Ajouter /index.xml automatiquement à l'URL de base pour le feed
	feedURL := blogBaseURL + "/index.xml"

	http.HandleFunc("/rss", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		fp := gofeed.NewParser()
		var feed *gofeed.Feed
		var err error

		if feedURL != "" {
			feed, err = fp.ParseURL(feedURL)
		} else {
			file, fileErr := os.Open("index.xml")
			if fileErr != nil {
				http.Error(w, fmt.Sprintf("Error opening local index.xml: %v", fileErr), http.StatusInternalServerError)
				return
			}
			defer file.Close()

			feed, err = fp.Parse(file)
		}

		if err != nil {
			http.Error(w, fmt.Sprintf("Error parsing RSS feed: %v", err), http.StatusBadGateway)
			return
		}
		var items []RSSItem
		for _, entry := range feed.Items {
			var tags []string
			if rawTags, ok := entry.Custom["tags"]; ok {
				splitTags := strings.Split(rawTags, "/")
				for _, tag := range splitTags {
					cleanTag := strings.TrimSpace(tag)
					if cleanTag != "" {
						tags = append(tags, cleanTag)
					}
				}
			}
			// Date (pubDate)
			dateStr := ""
			if entry.PublishedParsed != nil {
				dateStr = entry.PublishedParsed.Format("01/02/2006")
			} else if entry.Published != "" {
				dateStr = entry.Published
			}

			image := ""
			for _, enc := range entry.Enclosures {
				if strings.HasPrefix(enc.Type, "image") {
					image = enc.URL
					break
				}
			}

			items = append(items, RSSItem{
				Title:       entry.Title,
				Tags:        tags,
				Image:       image,
				Link:        entry.Link,
				Date:        dateStr,
				Description: entry.Description,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
	})

	// Endpoint proxy pour les images
	http.HandleFunc("/image-proxy", func(w http.ResponseWriter, r *http.Request) {
		// Headers CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			return
		}

		// Récupérer l'URL de l'image depuis les paramètres
		imageURL := r.URL.Query().Get("url")
		if imageURL == "" {
			http.Error(w, "URL parameter is required", http.StatusBadRequest)
			return
		}

		// Valider l'URL
		parsedURL, err := url.Parse(imageURL)
		if err != nil || !strings.HasPrefix(parsedURL.Scheme, "http") {
			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		// Remplacer l'URL publique par l'URL interne du cluster
		var internalURL string
		if strings.HasPrefix(imageURL, "https://blog.wheezy.fr/") {
			// Remplacer par l'URL interne
			internalURL = strings.Replace(imageURL, "https://blog.wheezy.fr", blogBaseURL, 1)
		} else {
			// Vérifier que c'est bien depuis blog.wheezy.fr pour la sécurité
			if !strings.Contains(parsedURL.Host, "wheezy.fr") {
				http.Error(w, "Unauthorized domain", http.StatusForbidden)
				return
			}
			internalURL = imageURL
		}

		// Faire la requête vers l'image en utilisant l'URL interne
		resp, err := http.Get(internalURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error fetching image: %v", err), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		// Copier les headers appropriés
		if contentType := resp.Header.Get("Content-Type"); contentType != "" {
			w.Header().Set("Content-Type", contentType)
		}
		if contentLength := resp.Header.Get("Content-Length"); contentLength != "" {
			w.Header().Set("Content-Length", contentLength)
		}

		// Headers pour le cache
		w.Header().Set("Cache-Control", "public, max-age=3600")

		// Copier le contenu de l'image
		w.WriteHeader(resp.StatusCode)
		_, err = io.Copy(w, resp.Body)
		if err != nil {
			log.Printf("Error copying image data: %v", err)
		}
	})

	log.Println("Server running on :3000")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
