package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/configuration"
	"github.com/jmoiron/sqlx"
)

type CallTagRepo struct{ db *sqlx.DB }

func NewCallTagRepo(db *sqlx.DB) *CallTagRepo { return &CallTagRepo{db: db} }

func (r *CallTagRepo) Create(ctx context.Context, ct *configuration.CallTag) error {
	_, err := r.db.NamedExecContext(ctx,
		`INSERT INTO call_tags (id, tenant_id, name, color, created_at)
		 VALUES (:id, :tenant_id, :name, :color, :created_at)`, ct)
	return err
}

func (r *CallTagRepo) GetByID(ctx context.Context, id int64) (*configuration.CallTag, error) {
	var ct configuration.CallTag
	err := r.db.GetContext(ctx, &ct, `SELECT * FROM call_tags WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &ct, err
}

func (r *CallTagRepo) List(ctx context.Context, tenantID int64) ([]*configuration.CallTag, error) {
	var items []*configuration.CallTag
	err := r.db.SelectContext(ctx, &items,
		`SELECT * FROM call_tags WHERE tenant_id = ? ORDER BY created_at DESC`, tenantID)
	return items, err
}

func (r *CallTagRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM call_tags WHERE id = ?`, id)
	return err
}

var _ configuration.CallTagRepository = (*CallTagRepo)(nil)
