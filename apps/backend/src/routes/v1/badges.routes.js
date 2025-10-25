import express from 'express';
import badgesController from '../../controllers/badges.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import {
  GetUserBadgesInputSchema,
  AwardBadgeInputSchema
} from '../../models/badges.model.js';

const router = express.Router();

// Public - get all available badges
router.get('/badges', badgesController.getAllBadges);

// Get user's badges
router.get(
  '/users/:userId/badges',
  authenticateUser,
  validateRequest(GetUserBadgesInputSchema),
  badgesController.getUserBadges
);

// Award badge (protected - maybe admin only?)
router.post(
  '/badges/award',
  authenticateUser,
  validateRequest(AwardBadgeInputSchema),
  badgesController.awardBadge
);

// Check and award badges for user (called after session completion)
router.post(
  '/users/:userId/badges/check',
  authenticateUser,
  validateRequest({ userId: z.string().uuid() }),
  badgesController.checkUserBadges
);

export default router;