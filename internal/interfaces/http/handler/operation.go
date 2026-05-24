package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/divord97/ccc/internal/domain/operation"
	"github.com/divord97/ccc/internal/interfaces/http/middleware"
	"github.com/divord97/ccc/pkg/response"
	"github.com/divord97/ccc/pkg/snowflake"
	"github.com/go-chi/chi/v5"
)

type AudioFileHandler struct {
	repo operation.AudioFileRepository
}

func NewAudioFileHandler(repo operation.AudioFileRepository) *AudioFileHandler {
	return &AudioFileHandler{repo: repo}
}

func (h *AudioFileHandler) Create(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	var in struct {
		Name     string `json:"name"`
		FileName string `json:"file_name"`
		Category string `json:"category"`
		FilePath string `json:"file_path"`
		FileSize int64  `json:"file_size"`
		Duration int    `json:"duration"`
		MimeType string `json:"mime_type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Name == "" || in.FilePath == "" {
		response.Error(w, http.StatusBadRequest, "name and file_path are required")
		return
	}
	af := &operation.AudioFile{
		ID:        snowflake.NextID(),
		TenantID:  tenantID,
		Name:      in.Name,
		FileName:  in.FileName,
		Category:  operation.AudioCategory(in.Category),
		FilePath:  in.FilePath,
		FileSize:  in.FileSize,
		Duration:  in.Duration,
		MimeType:  in.MimeType,
		CreatedAt: time.Now(),
	}
	if err := h.repo.Create(r.Context(), af); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, af)
}

func (h *AudioFileHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	af, err := h.repo.GetByID(r.Context(), id)
	if err != nil || af == nil {
		response.Error(w, http.StatusNotFound, "audio file not found")
		return
	}
	response.JSON(w, http.StatusOK, af)
}

func (h *AudioFileHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	category := r.URL.Query().Get("category")
	items, err := h.repo.List(r.Context(), tenantID, operation.AudioCategory(category))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *AudioFileHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.repo.Delete(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}

type BusinessHoursHandler struct {
	repo         operation.BusinessHoursRepository
	scheduleRepo operation.BusinessHoursScheduleRepository
}

func NewBusinessHoursHandler(repo operation.BusinessHoursRepository, scheduleRepo operation.BusinessHoursScheduleRepository) *BusinessHoursHandler {
	return &BusinessHoursHandler{repo: repo, scheduleRepo: scheduleRepo}
}

type businessHoursDetail struct {
	*operation.BusinessHours
	Schedules []*operation.BusinessHoursSchedule `json:"schedules"`
}

func (h *BusinessHoursHandler) Create(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	var in struct {
		Name      string                            `json:"name"`
		IsDefault bool                              `json:"is_default"`
		Timezone  string                            `json:"timezone"`
		Schedules []operation.BusinessHoursSchedule `json:"schedules"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Name == "" {
		response.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	now := time.Now()
	bh := &operation.BusinessHours{
		ID:        snowflake.NextID(),
		TenantID:  tenantID,
		Name:      in.Name,
		IsDefault: in.IsDefault,
		Timezone:  in.Timezone,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := h.repo.Create(r.Context(), bh); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	var schedules []*operation.BusinessHoursSchedule
	for _, s := range in.Schedules {
		schedule := s
		schedule.ID = snowflake.NextID()
		schedule.BusinessHoursID = bh.ID
		schedule.CreatedAt = now
		if err := h.scheduleRepo.Create(r.Context(), &schedule); err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		schedules = append(schedules, &schedule)
	}
	response.JSON(w, http.StatusCreated, businessHoursDetail{BusinessHours: bh, Schedules: schedules})
}

func (h *BusinessHoursHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	bh, err := h.repo.GetByID(r.Context(), id)
	if err != nil || bh == nil {
		response.Error(w, http.StatusNotFound, "business hours not found")
		return
	}
	schedules, err := h.scheduleRepo.GetByBusinessHoursID(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, businessHoursDetail{BusinessHours: bh, Schedules: schedules})
}

func (h *BusinessHoursHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	items, err := h.repo.List(r.Context(), tenantID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *BusinessHoursHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	bh, err := h.repo.GetByID(r.Context(), id)
	if err != nil || bh == nil {
		response.Error(w, http.StatusNotFound, "business hours not found")
		return
	}
	var in struct {
		Name      *string                            `json:"name"`
		IsDefault *bool                              `json:"is_default"`
		Timezone  *string                            `json:"timezone"`
		Schedules *[]operation.BusinessHoursSchedule `json:"schedules"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Name != nil {
		bh.Name = *in.Name
	}
	if in.IsDefault != nil {
		bh.IsDefault = *in.IsDefault
	}
	if in.Timezone != nil {
		bh.Timezone = *in.Timezone
	}
	bh.UpdatedAt = time.Now()
	if err := h.repo.Update(r.Context(), bh); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	var schedules []*operation.BusinessHoursSchedule
	if in.Schedules != nil {
		if err := h.scheduleRepo.DeleteByBusinessHoursID(r.Context(), id); err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		for _, s := range *in.Schedules {
			schedule := s
			schedule.ID = snowflake.NextID()
			schedule.BusinessHoursID = id
			schedule.CreatedAt = time.Now()
			if err := h.scheduleRepo.Create(r.Context(), &schedule); err != nil {
				response.Error(w, http.StatusInternalServerError, err.Error())
				return
			}
			schedules = append(schedules, &schedule)
		}
	} else {
		schedules, err = h.scheduleRepo.GetByBusinessHoursID(r.Context(), id)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	response.JSON(w, http.StatusOK, businessHoursDetail{BusinessHours: bh, Schedules: schedules})
}

func (h *BusinessHoursHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	_ = h.scheduleRepo.DeleteByBusinessHoursID(r.Context(), id)
	if err := h.repo.Delete(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}
