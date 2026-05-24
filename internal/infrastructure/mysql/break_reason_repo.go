package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/configuration"
	"github.com/jmoiron/sqlx"
)

type BreakReasonRepo struct{ db *sqlx.DB }

func NewBreakReasonRepo(db *sqlx.DB) *BreakReasonRepo { return &BreakReasonRepo{db: db} }

func (r *BreakReasonRepo) Create(ctx context.Context, br *configuration.BreakReason) error {
	_, err := r.db.NamedExecContext(ctx,
		`INSERT INTO break_reasons (id, tenant_id, code, name, is_system, sort_order, enabled, created_at, updated_at)
		 VALUES (:id, :tenant_id, :code, :name, :is_system, :sort_order, :enabled, :created_at, :updated_at)`, br)
	return err
}

func (r *BreakReasonRepo) GetByID(ctx context.Context, id int64) (*configuration.BreakReason, error) {
	var br configuration.BreakReason
	err := r.db.GetContext(ctx, &br, `SELECT * FROM break_reasons WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &br, err
}

func (r *BreakReasonRepo) Update(ctx context.Context, br *configuration.BreakReason) error {
	_, err := r.db.NamedExecContext(ctx,
		`UPDATE break_reasons SET code=:code, name=:name, is_system=:is_system, sort_order=:sort_order,
		 enabled=:enabled, updated_at=:updated_at WHERE id=:id`, br)
	return err
}

func (r *BreakReasonRepo) List(ctx context.Context, tenantID int64) ([]*configuration.BreakReason, error) {
	var items []*configuration.BreakReason
	err := r.db.SelectContext(ctx, &items,
		`SELECT * FROM break_reasons WHERE tenant_id = ? ORDER BY sort_order ASC, created_at ASC`, tenantID)
	return items, err
}

func (r *BreakReasonRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM break_reasons WHERE id = ?`, id)
	return err
}

var _ configuration.BreakReasonRepository = (*BreakReasonRepo)(nil)
