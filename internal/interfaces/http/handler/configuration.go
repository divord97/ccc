package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/divord97/ccc/internal/domain/configuration"
	"github.com/divord97/ccc/internal/interfaces/http/middleware"
	"github.com/divord97/ccc/pkg/response"
	"github.com/divord97/ccc/pkg/snowflake"
	"github.com/go-chi/chi/v5"
)

type BreakReasonHandler struct {
	repo configuration.BreakReasonRepository
}

func NewBreakReasonHandler(repo configuration.BreakReasonRepository) *BreakReasonHandler {
	return &BreakReasonHandler{repo: repo}
}

func (h *BreakReasonHandler) Create(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	var in struct {
		Code      string `json:"code"`
		Name      string `json:"name"`
		IsSystem  bool   `json:"is_system"`
		SortOrder int    `json:"sort_order"`
		Enabled   *bool  `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Code == "" || in.Name == "" {
		response.Error(w, http.StatusBadRequest, "code and name are required")
		return
	}
	enabled := true
	if in.Enabled != nil {
		enabled = *in.Enabled
	}
	now := time.Now()
	br := &configuration.BreakReason{
		ID:        snowflake.NextID(),
		TenantID:  tenantID,
		Code:      in.Code,
		Name:      in.Name,
		IsSystem:  in.IsSystem,
		SortOrder: in.SortOrder,
		Enabled:   enabled,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := h.repo.Create(r.Context(), br); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, br)
}

func (h *BreakReasonHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	br, err := h.repo.GetByID(r.Context(), id)
	if err != nil || br == nil {
		response.Error(w, http.StatusNotFound, "break reason not found")
		return
	}
	response.JSON(w, http.StatusOK, br)
}

func (h *BreakReasonHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	items, err := h.repo.List(r.Context(), tenantID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *BreakReasonHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	br, err := h.repo.GetByID(r.Context(), id)
	if err != nil || br == nil {
		response.Error(w, http.StatusNotFound, "break reason not found")
		return
	}
	var in struct {
		Code      *string `json:"code"`
		Name      *string `json:"name"`
		IsSystem  *bool   `json:"is_system"`
		SortOrder *int    `json:"sort_order"`
		Enabled   *bool   `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Code != nil {
		br.Code = *in.Code
	}
	if in.Name != nil {
		br.Name = *in.Name
	}
	if in.IsSystem != nil {
		br.IsSystem = *in.IsSystem
	}
	if in.SortOrder != nil {
		br.SortOrder = *in.SortOrder
	}
	if in.Enabled != nil {
		br.Enabled = *in.Enabled
	}
	br.UpdatedAt = time.Now()
	if err := h.repo.Update(r.Context(), br); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, br)
}

func (h *BreakReasonHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

type DispositionCodeHandler struct {
	repo configuration.DispositionCodeRepository
}

func NewDispositionCodeHandler(repo configuration.DispositionCodeRepository) *DispositionCodeHandler {
	return &DispositionCodeHandler{repo: repo}
}

func (h *DispositionCodeHandler) Create(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	var in struct {
		Code      string `json:"code"`
		Name      string `json:"name"`
		Category  string `json:"category"`
		SortOrder int    `json:"sort_order"`
		Enabled   *bool  `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Code == "" || in.Name == "" {
		response.Error(w, http.StatusBadRequest, "code and name are required")
		return
	}
	enabled := true
	if in.Enabled != nil {
		enabled = *in.Enabled
	}
	now := time.Now()
	dc := &configuration.DispositionCode{
		ID:        snowflake.NextID(),
		TenantID:  tenantID,
		Code:      in.Code,
		Name:      in.Name,
		Category:  in.Category,
		SortOrder: in.SortOrder,
		Enabled:   enabled,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := h.repo.Create(r.Context(), dc); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, dc)
}

func (h *DispositionCodeHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	dc, err := h.repo.GetByID(r.Context(), id)
	if err != nil || dc == nil {
		response.Error(w, http.StatusNotFound, "disposition code not found")
		return
	}
	response.JSON(w, http.StatusOK, dc)
}

func (h *DispositionCodeHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	items, err := h.repo.List(r.Context(), tenantID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *DispositionCodeHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	dc, err := h.repo.GetByID(r.Context(), id)
	if err != nil || dc == nil {
		response.Error(w, http.StatusNotFound, "disposition code not found")
		return
	}
	var in struct {
		Code      *string `json:"code"`
		Name      *string `json:"name"`
		Category  *string `json:"category"`
		SortOrder *int    `json:"sort_order"`
		Enabled   *bool   `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Code != nil {
		dc.Code = *in.Code
	}
	if in.Name != nil {
		dc.Name = *in.Name
	}
	if in.Category != nil {
		dc.Category = *in.Category
	}
	if in.SortOrder != nil {
		dc.SortOrder = *in.SortOrder
	}
	if in.Enabled != nil {
		dc.Enabled = *in.Enabled
	}
	dc.UpdatedAt = time.Now()
	if err := h.repo.Update(r.Context(), dc); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, dc)
}

func (h *DispositionCodeHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

type CallTagHandler struct {
	repo configuration.CallTagRepository
}

func NewCallTagHandler(repo configuration.CallTagRepository) *CallTagHandler {
	return &CallTagHandler{repo: repo}
}

func (h *CallTagHandler) Create(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	var in struct {
		Name  string `json:"name"`
		Color string `json:"color"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if in.Name == "" {
		response.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	if in.Color == "" {
		in.Color = "#3B82F6"
	}
	tag := &configuration.CallTag{
		ID:        snowflake.NextID(),
		TenantID:  tenantID,
		Name:      in.Name,
		Color:     in.Color,
		CreatedAt: time.Now(),
	}
	if err := h.repo.Create(r.Context(), tag); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, tag)
}

func (h *CallTagHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}
	tag, err := h.repo.GetByID(r.Context(), id)
	if err != nil || tag == nil {
		response.Error(w, http.StatusNotFound, "call tag not found")
		return
	}
	response.JSON(w, http.StatusOK, tag)
}

func (h *CallTagHandler) List(w http.ResponseWriter, r *http.Request) {
	tenantID := middleware.TenantIDFromCtx(r.Context())
	items, err := h.repo.List(r.Context(), tenantID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, items)
}

func (h *CallTagHandler) Delete(w http.ResponseWriter, r *http.Request) {
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
