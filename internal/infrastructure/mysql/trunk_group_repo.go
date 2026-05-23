package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/telephony"
	"github.com/jmoiron/sqlx"
)

type SIPTrunkGroupRepo struct {
	db *sqlx.DB
}

func NewSIPTrunkGroupRepo(db *sqlx.DB) *SIPTrunkGroupRepo {
	return &SIPTrunkGroupRepo{db: db}
}

func (r *SIPTrunkGroupRepo) Create(ctx context.Context, g *telephony.SIPTrunkGroup) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO sip_trunk_groups (id, tenant_id, name, strategy, created_at, updated_at)
		 VALUES (?,?,?,?,?,?)`,
		g.ID, g.TenantID, g.Name, g.Strategy, g.CreatedAt, g.UpdatedAt)
	return err
}

func (r *SIPTrunkGroupRepo) GetByID(ctx context.Context, id int64) (*telephony.SIPTrunkGroup, error) {
	var g telephony.SIPTrunkGroup
	err := r.db.GetContext(ctx, &g, "SELECT * FROM sip_trunk_groups WHERE id = ?", id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &g, err
}

func (r *SIPTrunkGroupRepo) Update(ctx context.Context, g *telephony.SIPTrunkGroup) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE sip_trunk_groups SET name=?, strategy=?, updated_at=? WHERE id=?`,
		g.Name, g.Strategy, g.UpdatedAt, g.ID)
	return err
}

func (r *SIPTrunkGroupRepo) List(ctx context.Context, tenantID int64, offset, limit int) ([]*telephony.SIPTrunkGroup, int64, error) {
	var total int64
	_ = r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM sip_trunk_groups WHERE tenant_id = ?", tenantID)
	var items []*telephony.SIPTrunkGroup
	err := r.db.SelectContext(ctx, &items, "SELECT * FROM sip_trunk_groups WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?", tenantID, limit, offset)
	return items, total, err
}

func (r *SIPTrunkGroupRepo) AddMember(ctx context.Context, m *telephony.SIPTrunkGroupMember) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO sip_trunk_group_members (id, group_id, sip_trunk_id, priority) VALUES (?,?,?,?)`,
		m.ID, m.GroupID, m.SIPTrunkID, m.Priority)
	return err
}

func (r *SIPTrunkGroupRepo) ListMembers(ctx context.Context, groupID int64) ([]*telephony.SIPTrunkGroupMember, error) {
	var items []*telephony.SIPTrunkGroupMember
	err := r.db.SelectContext(ctx, &items,
		"SELECT * FROM sip_trunk_group_members WHERE group_id = ? ORDER BY priority", groupID)
	return items, err
}
