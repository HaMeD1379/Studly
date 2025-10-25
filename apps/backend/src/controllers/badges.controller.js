import badgesService from '../services/badges.service.js';

export const createBadgesController = (service = badgesService) => {
  
  const getAllBadges = async (req, res, next) => {
    try {
      const badges = await service.getAllBadges();
      return res.status(200).json({ badges });
    } catch (error) {
      next(error);
    }
  };
  
  const getUserBadges = async (req, res, next) => {
    try {
      const { userId, includeProgress } = req.validated;
      const badges = await service.getUserBadges(userId, includeProgress);
      return res.status(200).json({ badges });
    } catch (error) {
      next(error);
    }
  };
  
  const awardBadge = async (req, res, next) => {
    try {
      const { userId, badgeId } = req.validated;
      const userBadge = await service.awardBadge(userId, badgeId);
      return res.status(201).json({ userBadge });
    } catch (error) {
      if (error.message === 'BADGE_ALREADY_EARNED') {
        return res.status(409).json({ 
          error: 'Badge already earned by user' 
        });
      }
      next(error);
    }
  };
  
  const checkUserBadges = async (req, res, next) => {
    try {
      const { userId } = req.validated;
      const newBadges = await service.checkAndAwardBadges(userId);
      return res.status(200).json({ newBadges });
    } catch (error) {
      next(error);
    }
  };
  
  return {
    getAllBadges,
    getUserBadges,
    awardBadge,
    checkUserBadges
  };
};

const defaultController = createBadgesController();
export default defaultController;