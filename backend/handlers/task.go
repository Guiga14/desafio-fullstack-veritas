package handlers

import (
	"kanban-api/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var tasks = []models.Task{}
var nextID = 1

func GetTasks(c *gin.Context) {
	c.JSON(http.StatusOK, tasks)
}

func CreateTask(c *gin.Context) {
	var newTask models.Task
	if err := c.ShouldBindJSON(&newTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newTask.ID = nextID
	if newTask.Status == "" {
		newTask.Status = "TODO"
	}
	nextID++
	tasks = append(tasks, newTask)
	c.JSON(http.StatusCreated, newTask)
}

func UpdateTaskStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, _ := strconv.Atoi(idParam)

	// Agora preparamos para receber a estrutura completa da tarefa
	var updateData models.Task
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, task := range tasks {
		if task.ID == id {
			// Atualiza apenas os campos que vieram preenchidos do React
			if updateData.Status != "" {
				tasks[i].Status = updateData.Status
			}
			if updateData.Title != "" {
				tasks[i].Title = updateData.Title
			}
			if updateData.Description != "" {
				tasks[i].Description = updateData.Description
			}
			if updateData.DueDate != "" {
				tasks[i].DueDate = updateData.DueDate
			}

			c.JSON(http.StatusOK, tasks[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "Tarefa não encontrada"})
}

func DeleteTask(c *gin.Context) {
	idParam := c.Param("id")
	id, _ := strconv.Atoi(idParam)
	for i, task := range tasks {
		if task.ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "Deletado com sucesso"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "Tarefa não encontrada"})
}
