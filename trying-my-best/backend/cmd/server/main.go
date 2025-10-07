package main

import (
	"log"
	"os"
	docs "totallyguysproject/docs"
	"totallyguysproject/internal/database"
	"totallyguysproject/internal/server"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	db := database.InitDB()

	// Создаем роутер
	router := gin.Default()

	// Добавляем CORS middleware ПЕРВЫМ
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Accept, Origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Инициализируем все роуты с нашим роутером (с CORS)
	server.NewServerWithRouter(db, router)

	docs.SwaggerInfo.BasePath = "/api"

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler,
		ginSwagger.URL("http://localhost:8080/swagger/doc.json"),
		ginSwagger.DefaultModelsExpandDepth(-1)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Backend server starting on http://localhost:%s", port)
	log.Printf("🌐 CORS enabled for: http://localhost:3000")
	router.Run(":" + port)
}
