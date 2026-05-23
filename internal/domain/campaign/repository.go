package campaign

import "context"

type CampaignRepository interface {
	Create(ctx context.Context, c *Campaign) error
	GetByID(ctx context.Context, id int64) (*Campaign, error)
	Update(ctx context.Context, c *Campaign) error
	List(ctx context.Context, tenantID int64, offset, limit int) ([]*Campaign, int64, error)
}

type CampaignCaseRepository interface {
	Create(ctx context.Context, c *CampaignCase) error
	BulkCreate(ctx context.Context, cases []*CampaignCase) error
	GetByID(ctx context.Context, id int64) (*CampaignCase, error)
	Update(ctx context.Context, c *CampaignCase) error
	ListByCampaign(ctx context.Context, campaignID int64, offset, limit int) ([]*CampaignCase, int64, error)
	GetNextPending(ctx context.Context, campaignID int64) (*CampaignCase, error)
	CountByStatus(ctx context.Context, campaignID int64) (pending, completed, failed int, err error)
}
