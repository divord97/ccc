package advancedai

import (
	"context"
	"fmt"

	"github.com/divord97/ccc/internal/domain/ai"
	"github.com/divord97/ccc/internal/infrastructure/llm"
	"github.com/rs/zerolog"
)

// Service orchestrates advanced AI operations.
type Service struct {
	commAgentSvc    *ai.CommAgentService
	voiceSvc        *ai.VoiceProfileService
	analysisSvc     *ai.ConversationAnalysisService
	trainingSvc     *ai.TrainingService
	ringSvc         *ai.RingAnalysisService
	fullDuplexSvc   *ai.FullDuplexService
	commAgentLLM    llm.CommAgentProvider
	voiceCloneLLM   llm.VoiceCloningProvider
	analyticsLLM    llm.ConversationAnalyticsProvider
	ringLLM         llm.RingAnalysisProvider
	fullDuplexLLM   llm.FullDuplexProvider
	trainingLLM     llm.TrainingProvider
	logger          zerolog.Logger
}

// Deps holds all dependencies for the advanced AI service.
type Deps struct {
	CommAgentSvc  *ai.CommAgentService
	VoiceSvc      *ai.VoiceProfileService
	AnalysisSvc   *ai.ConversationAnalysisService
	TrainingSvc   *ai.TrainingService
	RingSvc       *ai.RingAnalysisService
	FullDuplexSvc *ai.FullDuplexService
	CommAgentLLM  llm.CommAgentProvider
	VoiceCloneLLM llm.VoiceCloningProvider
	AnalyticsLLM  llm.ConversationAnalyticsProvider
	RingLLM       llm.RingAnalysisProvider
	FullDuplexLLM llm.FullDuplexProvider
	TrainingLLM   llm.TrainingProvider
	Logger        zerolog.Logger
}

func NewService(d Deps) *Service {
	return &Service{
		commAgentSvc:  d.CommAgentSvc,
		voiceSvc:      d.VoiceSvc,
		analysisSvc:   d.AnalysisSvc,
		trainingSvc:   d.TrainingSvc,
		ringSvc:       d.RingSvc,
		fullDuplexSvc: d.FullDuplexSvc,
		commAgentLLM:  d.CommAgentLLM,
		voiceCloneLLM: d.VoiceCloneLLM,
		analyticsLLM:  d.AnalyticsLLM,
		ringLLM:       d.RingLLM,
		fullDuplexLLM: d.FullDuplexLLM,
		trainingLLM:   d.TrainingLLM,
		logger:        d.Logger,
	}
}

// HandleConversationTurn processes a single turn in an autonomous agent conversation.
func (s *Service) HandleConversationTurn(ctx context.Context, tenantID, commAgentID int64, userMessage string) (string, bool, error) {
	agent, err := s.commAgentSvc.Get(ctx, tenantID, commAgentID)
	if err != nil {
		return "", false, err
	}

	reply, err := s.commAgentLLM.GenerateReply(ctx, agent.SystemPrompt, "", userMessage)
	if err != nil {
		s.logger.Error().Err(err).Msg("advancedai: generate reply failed")
		return "", false, err
	}

	shouldTransfer, reason, err := s.commAgentLLM.ShouldTransfer(ctx, agent.SystemPrompt, userMessage+"\n"+reply)
	if err != nil {
		s.logger.Warn().Err(err).Msg("advancedai: transfer check failed, continuing")
		shouldTransfer = false
	}
	if shouldTransfer {
		s.logger.Info().Str("reason", reason).Msg("advancedai: transfer recommended")
	}

	return reply, shouldTransfer, nil
}

// RunConversationAnalysis executes a batch analysis task.
func (s *Service) RunConversationAnalysis(ctx context.Context, tenantID, taskID int64, transcripts []string) error {
	task, err := s.analysisSvc.Get(ctx, tenantID, taskID)
	if err != nil {
		return err
	}

	if err := s.analysisSvc.MarkRunning(ctx, task); err != nil {
		return err
	}

	var resultJSON string
	switch task.Type {
	case ai.AnalysisTypeIntent:
		resultJSON, err = s.analyticsLLM.MineIntents(ctx, transcripts)
	case ai.AnalysisTypeSOP:
		resultJSON, err = s.analyticsLLM.DiscoverSOPs(ctx, transcripts)
	case ai.AnalysisTypeSalesTalk:
		resultJSON, err = s.analyticsLLM.ExtractSalesScripts(ctx, transcripts)
	case ai.AnalysisTypeTopic:
		resultJSON, err = s.analyticsLLM.ClusterTopics(ctx, transcripts)
	default:
		return fmt.Errorf("advancedai: unsupported analysis type: %s", task.Type)
	}
	if err != nil {
		s.logger.Error().Err(err).Msg("advancedai: analysis failed")
		return err
	}

	return s.analysisSvc.Complete(ctx, task, resultJSON)
}

// EvaluateSimulatedCall uses AI to score a practice call.
func (s *Service) EvaluateSimulatedCall(ctx context.Context, scenario, transcript string) (string, int, error) {
	return s.trainingLLM.EvaluateSimulatedCall(ctx, scenario, transcript)
}
