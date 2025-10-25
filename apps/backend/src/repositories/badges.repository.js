import supabase from '../config/supabase.js';

export const createBadgesRepository = (client = supabase) => {
  
  const findAllBadges = async () => {
    const { data, error } = await client
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data ?? [];
  };
  
  const findBadgeById = async (badgeId) => {
    const { data, error } = await client
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();
    
    if (error) throw error;
    return data;
  };
  
  const findUserBadges = async (userId, includeProgress = true) => {
    let query = client
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId);
    
    if (!includeProgress) {
      query = query.not('earned_at', 'is', null);
    }
    
    const { data, error } = await query.order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  };
  
  const findUserBadgeByIds = async (userId, badgeId) => {
    const { data, error } = await client
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  };
  
  const createUserBadge = async (userBadge) => {
    const { data, error } = await client
      .from('user_badges')
      .insert(userBadge)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };
  
  const updateUserBadge = async (id, updates) => {
    const { data, error } = await client
      .from('user_badges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };
  
  const upsertUserBadge = async (userBadge) => {
    const { data, error } = await client
      .from('user_badges')
      .upsert(userBadge, {
        onConflict: 'user_id,badge_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };
  
  // For badge checking logic
    const getUserSessionStats = async (userId, fromDate = null) => {
    let query = client
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .not('end_time', 'is', null); // Only completed sessions
    
    if (fromDate) {
        query = query.gte('date', fromDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
    };
  
  return {
    findAllBadges,
    findBadgeById,
    findUserBadges,
    findUserBadgeByIds,
    createUserBadge,
    updateUserBadge,
    upsertUserBadge,
    getUserSessionStats
  };
};

const defaultRepository = createBadgesRepository();
export default defaultRepository;