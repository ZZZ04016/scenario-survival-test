import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../useGameStore';
import { getLevelInfo, calculateXpReward } from '../../data/gamification';

describe('游戏化系统', () => {
  beforeEach(() => {
    // 每个测试前重置状态
    useGameStore.getState()._reset();
  });

  describe('XP 与等级', () => {
    it('答题正确应获得 XP', () => {
      const result = useGameStore.getState().recordAnswer({
        questionId: 1,
        worldviewId: 'palace',
        knowledgePointId: 'risk-assessment',
        selectedTrait: 'cautious',
        questionType: 'choice',
        responseTimeMs: 5000,
      });
      expect(result.xpGained).toBeGreaterThan(5);
      expect(result.isCorrect).toBe(true);
      expect(useGameStore.getState().xp).toBe(result.xpGained);
    });

    it('答题错误获得少量参与 XP', () => {
      const result = useGameStore.getState().recordAnswer({
        questionId: 1,
        worldviewId: 'palace',
        knowledgePointId: 'risk-assessment',
        selectedTrait: 'decisive', // 非最优解
        questionType: 'choice',
        responseTimeMs: 5000,
      });
      expect(result.xpGained).toBe(5);
      expect(result.isCorrect).toBe(false);
    });

    it('限时题快速作答应有速度加成', () => {
      const result = useGameStore.getState().recordAnswer({
        questionId: 1,
        worldviewId: 'palace',
        knowledgePointId: 'crisis-decision',
        selectedTrait: 'decisive',
        questionType: 'timed',
        responseTimeMs: 2000, // 10秒限时，2秒答完
        timeLimit: 10,
      });
      // 基础10 + 题型加成8 + 速度加成5 = 23
      expect(result.xpGained).toBe(23);
    });

    it('累计 XP 应正确升级', () => {
      const { level: l1 } = getLevelInfo(0);
      expect(l1.level).toBe(1);
      const { level: l2 } = getLevelInfo(100);
      expect(l2.level).toBe(2);
      const { level: l3 } = getLevelInfo(1000);
      expect(l3.level).toBe(6);
    });
  });

  describe('连续打卡', () => {
    it('首次答题 streak 应为 1', () => {
      useGameStore.getState().recordAnswer({
        questionId: 1,
        worldviewId: 'palace',
        knowledgePointId: 'risk-assessment',
        selectedTrait: 'cautious',
        questionType: 'choice',
        responseTimeMs: 5000,
      });
      expect(useGameStore.getState().streak).toBe(1);
    });
  });

  describe('知识点掌握度', () => {
    it('答对知识点应提升掌握度', () => {
      useGameStore.getState().recordAnswer({
        questionId: 1,
        worldviewId: 'palace',
        knowledgePointId: 'risk-assessment',
        selectedTrait: 'cautious',
        questionType: 'choice',
        responseTimeMs: 5000,
      });
      const mastery = useGameStore.getState().getMastery('risk-assessment');
      expect(mastery.totalCount).toBe(1);
      expect(mastery.correctCount).toBe(1);
      expect(mastery.mastery).toBe(1);
    });

    it('答错知识点掌握度应降低', () => {
      useGameStore.getState().recordAnswer({
        questionId: 1,
        worldviewId: 'palace',
        knowledgePointId: 'risk-assessment',
        selectedTrait: 'decisive',
        questionType: 'choice',
        responseTimeMs: 5000,
      });
      const mastery = useGameStore.getState().getMastery('risk-assessment');
      expect(mastery.correctCount).toBe(0);
      expect(mastery.mastery).toBe(0);
    });
  });

  describe('成就解锁', () => {
    it('达到对应 XP 应解锁成就', () => {
      // 手动设置 XP 到 500+
      const state = useGameStore.getState();
      // 通过多次答题累计 XP
      for (let i = 0; i < 50; i++) {
        state.recordAnswer({
          questionId: i,
          worldviewId: 'palace',
          knowledgePointId: 'risk-assessment',
          selectedTrait: 'cautious',
          questionType: 'choice',
          responseTimeMs: 5000,
        });
      }
      const xp = useGameStore.getState().xp;
      expect(xp).toBeGreaterThanOrEqual(500);
      const achievements = useGameStore.getState().achievements;
      expect(achievements).toContain('xp-500');
    });
  });

  describe('XP 计算函数', () => {
    it('正确答题基础分 10', () => {
      expect(calculateXpReward({ questionType: 'choice', isCorrect: true })).toBe(10);
    });
    it('错误答题 5 分', () => {
      expect(calculateXpReward({ questionType: 'choice', isCorrect: false })).toBe(5);
    });
    it('情景题加成 5', () => {
      expect(calculateXpReward({ questionType: 'scenario', isCorrect: true })).toBe(15);
    });
    it('探索题加成 10', () => {
      expect(calculateXpReward({ questionType: 'exploration', isCorrect: true })).toBe(20);
    });
  });
});
