package campaign

import (
	"context"
	"sync"
)

type MockCampaignRepo struct {
	mu   sync.RWMutex
	data map[int64]*Campaign
}

func NewMockCampaignRepo() *MockCampaignRepo {
	return &MockCampaignRepo{data: make(map[int64]*Campaign)}
}

func (r *MockCampaignRepo) Create(_ context.Context, c *Campaign) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data[c.ID] = c
	return nil
}

func (r *MockCampaignRepo) GetByID(_ context.Context, id int64) (*Campaign, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if c, ok := r.data[id]; ok {
		return c, nil
	}
	return nil, nil
}

func (r *MockCampaignRepo) Update(_ context.Context, c *Campaign) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data[c.ID] = c
	return nil
}

func (r *MockCampaignRepo) List(_ context.Context, tenantID int64, offset, limit int) ([]*Campaign, int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []*Campaign
	for _, c := range r.data {
		if c.TenantID == tenantID {
			result = append(result, c)
		}
	}
	total := int64(len(result))
	if offset >= len(result) {
		return nil, total, nil
	}
	end := offset + limit
	if end > len(result) {
		end = len(result)
	}
	return result[offset:end], total, nil
}

type MockCampaignCaseRepo struct {
	mu   sync.RWMutex
	data map[int64]*CampaignCase
}

func NewMockCampaignCaseRepo() *MockCampaignCaseRepo {
	return &MockCampaignCaseRepo{data: make(map[int64]*CampaignCase)}
}

func (r *MockCampaignCaseRepo) Create(_ context.Context, c *CampaignCase) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data[c.ID] = c
	return nil
}

func (r *MockCampaignCaseRepo) BulkCreate(_ context.Context, cases []*CampaignCase) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, c := range cases {
		r.data[c.ID] = c
	}
	return nil
}

func (r *MockCampaignCaseRepo) GetByID(_ context.Context, id int64) (*CampaignCase, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if c, ok := r.data[id]; ok {
		return c, nil
	}
	return nil, nil
}

func (r *MockCampaignCaseRepo) Update(_ context.Context, c *CampaignCase) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data[c.ID] = c
	return nil
}

func (r *MockCampaignCaseRepo) ListByCampaign(_ context.Context, campaignID int64, offset, limit int) ([]*CampaignCase, int64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []*CampaignCase
	for _, c := range r.data {
		if c.CampaignID == campaignID {
			result = append(result, c)
		}
	}
	total := int64(len(result))
	if offset >= len(result) {
		return nil, total, nil
	}
	end := offset + limit
	if end > len(result) {
		end = len(result)
	}
	return result[offset:end], total, nil
}

func (r *MockCampaignCaseRepo) GetNextPending(_ context.Context, campaignID int64) (*CampaignCase, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, c := range r.data {
		if c.CampaignID == campaignID && c.Status == CaseStatusPending {
			return c, nil
		}
	}
	return nil, nil
}

func (r *MockCampaignCaseRepo) CountByStatus(_ context.Context, campaignID int64) (pending, completed, failed int, err error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, c := range r.data {
		if c.CampaignID != campaignID {
			continue
		}
		switch c.Status {
		case CaseStatusPending:
			pending++
		case CaseStatusCompleted:
			completed++
		case CaseStatusFailed:
			failed++
		}
	}
	return
}
