package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/operation"
	"github.com/jmoiron/sqlx"
)

type BusinessHoursRepo struct{ db *sqlx.DB }

func NewBusinessHoursRepo(db *sqlx.DB) *BusinessHoursRepo { return &BusinessHoursRepo{db: db} }

func (r *BusinessHoursRepo) Create(ctx context.Context, bh *operation.BusinessHours) error {
	_, err := r.db.NamedExecContext(ctx,
		`INSERT INTO business_hours (id, tenant_id, name, is_default, timezone, created_at, updated_at)
		 VALUES (:id, :tenant_id, :name, :is_default, :timezone, :created_at, :updated_at)`, bh)
	return err
}

func (r *BusinessHoursRepo) GetByID(ctx context.Context, id int64) (*operation.BusinessHours, error) {
	var bh operation.BusinessHours
	err := r.db.GetContext(ctx, &bh, `SELECT * FROM business_hours WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &bh, err
}

func (r *BusinessHoursRepo) Update(ctx context.Context, bh *operation.BusinessHours) error {
	_, err := r.db.NamedExecContext(ctx,
		`UPDATE business_hours SET name=:name, is_default=:is_default, timezone=:timezone, updated_at=:updated_at WHERE id=:id`, bh)
	return err
}

func (r *BusinessHoursRepo) List(ctx context.Context, tenantID int64) ([]*operation.BusinessHours, error) {
	var items []*operation.BusinessHours
	err := r.db.SelectContext(ctx, &items,
		`SELECT * FROM business_hours WHERE tenant_id = ? ORDER BY created_at DESC`, tenantID)
	return items, err
}

func (r *BusinessHoursRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM business_hours WHERE id = ?`, id)
	return err
}

type BusinessHoursScheduleRepo struct{ db *sqlx.DB }

func NewBusinessHoursScheduleRepo(db *sqlx.DB) *BusinessHoursScheduleRepo {
	return &BusinessHoursScheduleRepo{db: db}
}

func (r *BusinessHoursScheduleRepo) Create(ctx context.Context, s *operation.BusinessHoursSchedule) error {
	_, err := r.db.NamedExecContext(ctx,
		`INSERT INTO business_hours_schedule (id, business_hours_id, day_type, day_of_week, specific_date, start_time, end_time, created_at)
		 VALUES (:id, :business_hours_id, :day_type, :day_of_week, :specific_date, :start_time, :end_time, :created_at)`, s)
	return err
}

func (r *BusinessHoursScheduleRepo) GetByBusinessHoursID(ctx context.Context, bhID int64) ([]*operation.BusinessHoursSchedule, error) {
	var items []*operation.BusinessHoursSchedule
	err := r.db.SelectContext(ctx, &items,
		`SELECT * FROM business_hours_schedule WHERE business_hours_id = ? ORDER BY created_at ASC`, bhID)
	return items, err
}

func (r *BusinessHoursScheduleRepo) DeleteByBusinessHoursID(ctx context.Context, bhID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM business_hours_schedule WHERE business_hours_id = ?`, bhID)
	return err
}

var _ operation.BusinessHoursRepository = (*BusinessHoursRepo)(nil)
var _ operation.BusinessHoursScheduleRepository = (*BusinessHoursScheduleRepo)(nil)
