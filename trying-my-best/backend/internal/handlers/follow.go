package handlers

import (
	"net/http"
	"strconv"
	"totallyguysproject/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// POST /users/:id/follow
func FollowUser(c *gin.Context, db *gorm.DB) {
	uid, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	myID := uid.(uint)

	targetID64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	targetID := uint(targetID64)

	if myID == targetID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot follow yourself"})
		return
	}

	var existing models.Follow
	err = db.Where("follower_id= ? AND followed_id = ?", myID, targetID).First(&existing).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "already following"})
		return
	}
	if err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	follow := models.Follow{
		FollowerID: myID,
		FollowedID: targetID,
	}
	if err := db.Create(&follow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to follow"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "followed"})
}

// DELETE /users/:id/follow
func UnfollowUser(c *gin.Context, db *gorm.DB) {
	uid, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	myID := uid.(uint)

	targetID64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	targetID := uint(targetID64)

	if err := db.Where("follower_id = ? AND followed_id = ?", myID, targetID).Unscoped().Delete(&models.Follow{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unfollow"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "unfollowed"})
}

// GET /users/:id/followers
func GetFollowersByID(c *gin.Context, db *gorm.DB) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	userID := uint(id64)

	var followers []models.User
	db.Joins("JOIN follows ON follows.follower_id = users.id").
		Where("follows.followed_id = ?", userID).
		Find(&followers)

	c.JSON(http.StatusOK, gin.H{"followers": followers})
}

// GET /users/:id/following
func GetFollowingByID(c *gin.Context, db *gorm.DB) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	userID := uint(id64)

	var following []models.User
	db.Joins("JOIN follows ON follows.followed_id = users.id").
		Where("follows.follower_id = ?", userID).
		Find(&following)

	c.JSON(http.StatusOK, gin.H{"following": following})
}

// GET /users/me/followers
func GetMyFollowers(c *gin.Context, db *gorm.DB) {
	uid, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := uid.(uint)

	var followers []models.User
	db.Joins("JOIN follows ON follows.follower_id = users.id").
		Where("follows.followed_id = ?", userID).
		Find(&followers)

	c.JSON(http.StatusOK, gin.H{"followers": followers})
}

// GET /users/me/following
func GetMyFollowing(c *gin.Context, db *gorm.DB) {
	uid, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID := uid.(uint)

	var following []models.User
	db.Joins("JOIN follows ON follows.followed_id = users.id").
		Where("follows.follower_id = ?", userID).
		Find(&following)

	c.JSON(http.StatusOK, gin.H{"following": following})
}
