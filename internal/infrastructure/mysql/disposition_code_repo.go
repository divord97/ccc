package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/configuration"
	"github.com/jmoiron/sqlx"
)

type DispositionCodeRepo struct{ db *sqlx.DB }

func NewDispositionCodeRepo(db *sqlx.DB) *DispositionCodeRepo { return &DispositionCodeRepo{db: db} }

func (r *DispositionCodeRepo) Create(ctx context.Context, dc *configuration.DispositionCode) error {
	_, err := r.db.NamedExecContext(ctx,
		`INSERT INTO disposition_codes (id, tenant_id, code, name, category, sort_order, enabled, created_at, updated_at)
		 VALUES (:id, :tenant_id, :code, :name, :category, :sort_order, :enabled, :created_at, :updated_at)`, dc)
	return err
}

func (r *DispositionCodeRepo) GetByID(ctx context.Context, id int64) (*configuration.DispositionCode, error) {
	var dc configuration.DispositionCode
	err := r.db.GetContext(ctx, &dc, `SELECT * FROM disposition_codes WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &dc, err
}

func (r *DispositionCodeRepo) Update(ctx context.Context, dc *configuration.DispositionCode) error {
	_, err := r.db.NamedExecContext(ctx,
		`UPDATE disposition_codes SET code=:code, name=:name, category=:category, sort_order=:sort_order,
		 enabled=:enabled, updated_at=:updated_at WHERE id=:id`, dc)
	return err
}

func (r *DispositionCodeRepo) List(ctx context.Context, tenantID int64) ([]*configuration.DispositionCode, error) {
	var items []*configuration.DispositionCode
	err := r.db.SelectContext(ctx, &items,
		`SELECT * FROM disposition_codes WHERE tenant_id = ? ORDER BY sort_order ASC, created_at ASC`, tenantID)
	return items, err
}

func (r *DispositionCodeRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM disposition_codes WHERE id = ?`, id)
	return err
}

var _ configuration.DispositionCodeRepository = (*DispositionCodeRepo)(nil)
