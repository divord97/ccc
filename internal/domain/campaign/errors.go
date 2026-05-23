package campaign

import "errors"

var (
	ErrCampaignNotFound    = errors.New("campaign not found")
	ErrCaseNotFound        = errors.New("campaign case not found")
	ErrCampaignNotDraft    = errors.New("campaign is not in draft state")
	ErrCampaignNotRunning  = errors.New("campaign is not running")
	ErrCampaignNotPaused   = errors.New("campaign is not paused")
	ErrNoCasesAvailable    = errors.New("no cases available for dialing")
	ErrInvalidDialingMode  = errors.New("invalid dialing mode")
	ErrMissingPhoneNumber  = errors.New("phone number is required")
	ErrCampaignNoCases     = errors.New("campaign has no cases to start")
)
