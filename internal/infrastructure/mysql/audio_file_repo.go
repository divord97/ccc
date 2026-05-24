package mysql

import (
	"context"
	"database/sql"

	"github.com/divord97/ccc/internal/domain/operation"
	"github.com/jmoiron/sqlx"
)

type AudioFileRepo struct{ db *sqlx.DB }

func NewAudioFileRepo(db *sqlx.DB) *AudioFileRepo { return &AudioFileRepo{db: db} }

func (r *AudioFileRepo) Create(ctx context.Context, af *operation.AudioFile) error {
	_, err := r.db.NamedExecContext(ctx,
		`INSERT INTO audio_files (id, tenant_id, name, file_name, category, file_path, file_size, duration, mime_type, created_at)
		 VALUES (:id, :tenant_id, :name, :file_name, :category, :file_path, :file_size, :duration, :mime_type, :created_at)`, af)
	return err
}

func (r *AudioFileRepo) GetByID(ctx context.Context, id int64) (*operation.AudioFile, error) {
	var af operation.AudioFile
	err := r.db.GetContext(ctx, &af, `SELECT * FROM audio_files WHERE id = ?`, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &af, err
}

func (r *AudioFileRepo) List(ctx context.Context, tenantID int64, category operation.AudioCategory) ([]*operation.AudioFile, error) {
	query := `SELECT * FROM audio_files WHERE tenant_id = ?`
	args := []interface{}{tenantID}
	if category != "" {
		query += " AND category = ?"
		args = append(args, category)
	}
	query += " ORDER BY created_at DESC"
	var items []*operation.AudioFile
	err := r.db.SelectContext(ctx, &items, query, args...)
	return items, err
}

func (r *AudioFileRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM audio_files WHERE id = ?`, id)
	return err
}

var _ operation.AudioFileRepository = (*AudioFileRepo)(nil)
