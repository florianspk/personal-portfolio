package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
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

	feedURL := os.Getenv("RSS_FEED_URL")

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

	log.Println("Server running on :3000")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
