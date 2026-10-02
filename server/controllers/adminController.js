import User from '../models/User.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import GalleryImage from '../models/GalleryImage.js';
import Review from '../models/Review.js';

function dayStart(offsetDays = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offsetDays);
  return d;
}

// GET /api/admin/overview — whole-platform numbers from real data
export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const today = dayStart(0);
    const weekAgo = dayStart(6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newUsersWeek,
      totalOrders,
      paidAgg,
      todayAgg,
      weekAgg,
      monthAgg,
      byStatus,
      byPayment,
      menuCount,
      galleryCount,
      reviewCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: weekAgo } } }, { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
      MenuItem.countDocuments(),
      GalleryImage.countDocuments(),
      Review.countDocuments({ isApproved: true }),
    ]);

    // Orders per day, last 14 days
    const daily = await Order.aggregate([
      { $match: { createdAt: { $gte: dayStart(13) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Most ordered items (by quantity)
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { qty: -1 } },
      { $limit: 6 },
    ]);

    // Most active customers
    const topCustomers = await Order.aggregate([
      { $match: { user: { $ne: null } } },
      { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$total' } } },
      { $sort: { spent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', avatar: '$user.avatar', orders: 1, spent: 1 } },
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(6)
      .select('orderNumber customerName total status paymentStatus paymentMethod createdAt');

    const paid = paidAgg[0] || { revenue: 0, count: 0 };
    const t = todayAgg[0] || { count: 0, revenue: 0 };
    const w = weekAgg[0] || { count: 0, revenue: 0 };
    const m = monthAgg[0] || { count: 0, revenue: 0 };

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, newWeek: newUsersWeek },
        orders: {
          total: totalOrders,
          today: t.count, week: w.count, month: m.count,
          avgValue: totalOrders ? Math.round(paid.revenue / Math.max(totalOrders, 1)) : 0,
        },
        revenue: { total: paid.revenue, paidCount: paid.count, today: t.revenue, week: w.revenue, month: m.revenue },
        byStatus, byPayment, daily, topItems, topCustomers, recentOrders,
        catalog: { menu: menuCount, gallery: galleryCount, reviews: reviewCount },
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users — search/filter/sort/paginate + per-user order stats
export const listUsers = async (req, res) => {
  try {
    const { search = '', active = '', provider = '', sort = 'newest', page = 1, limit = 15 } = req.query;

    const match = {};
    if (search.trim()) {
      const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      match.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    if (active === 'true') match.isActive = true;
    if (active === 'false') match.isActive = false;
    if (['local', 'google', 'both'].includes(provider)) match.authProvider = provider;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
      spending: { totalSpent: -1 },
      orders: { orderCount: -1 },
    };
    const sortStage = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 15));

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          pipeline: [{ $project: { total: 1, createdAt: 1, status: 1 } }],
          as: 'orderStats',
        },
      },
      {
        $addFields: {
          orderCount: { $size: '$orderStats' },
          totalSpent: { $sum: '$orderStats.total' },
          lastOrderAt: { $max: '$orderStats.createdAt' },
        },
      },
      { $project: { password: 0, resetOtpHash: 0, orderStats: 0 } },
      { $sort: sortStage },
      {
        $facet: {
          data: [{ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum }],
          total: [{ $count: 'n' }],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);
    res.json({
      success: true,
      data: result?.data || [],
      pagination: {
        page: pageNum, limit: limitNum,
        total: result?.total?.[0]?.n || 0,
        pages: Math.ceil((result?.total?.[0]?.n || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users/:id — profile + orders + totals
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetOtpHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20)
      .select('orderNumber total status paymentStatus paymentMethod createdAt items');
    const agg = await Order.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, count: { $sum: 1 }, spent: { $sum: '$total' } } },
    ]);

    res.json({
      success: true,
      data: {
        user,
        orders,
        totals: agg[0] || { count: 0, spent: 0 },
      },
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid user ID' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/admin/users/:id/status { isActive } — activate/deactivate
export const setUserActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be true or false' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true })
      .select('-password -resetOtpHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin set user active error:', error);
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid user ID' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
