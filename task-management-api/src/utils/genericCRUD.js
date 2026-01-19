const { getCache, setCache, deleteCache, deleteCachePattern } = require('./cache');


class GenericCRUD {
    constructor(Model, cachePrefix = '') {
        this.Model = Model;
        this.cachePrefix = cachePrefix;
    }

    create = async (req, res, next) => {
        try {
            const data = { ...req.body, createdBy: req.user._id };
            const doc = await this.Model.create(data);

            if (this.cachePrefix) {
                await deleteCachePattern(`${this.cachePrefix}:*`);
            }

            const io = req.app.get('io');
            if (io) {
                io.emit(`${this.cachePrefix}:created`, doc);
                if (doc.assignedTo) {
                    io.to(`user-${doc.assignedTo}`).emit(`${this.cachePrefix}:assigned`, doc);
                }
            }

            res.status(201).json({
                success: true,
                message: `${this.Model.modelName} created successfully`,
                data: doc,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 10,
                sort = '-createdAt',
                search,
                ...filters
            } = req.query;

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            let queryObj = { ...filters };

            if (search) {
                queryObj.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            if (req.user.role === 'user') {
                queryObj.$and = [
                    {
                        $or: [
                            { createdBy: req.user._id },
                            { assignedTo: req.user._id },
                        ],
                    },
                ];
                if (queryObj.$or) {
                    queryObj.$and.push({ $or: queryObj.$or });
                    delete queryObj.$or;
                }
            } else if (req.user.role === 'manager') {
                const teamMembers = await require('../models/User').find({
                    team: req.user.team,
                }).select('_id');
                const teamMemberIds = teamMembers.map((m) => m._id);
                const accessControl = {
                    $or: [
                        { createdBy: req.user._id },
                        { assignedTo: { $in: teamMemberIds } },
                    ],
                };
                if (queryObj.$or) {
                    queryObj.$and = [accessControl, { $or: queryObj.$or }];
                    delete queryObj.$or;
                } else {
                    queryObj = { ...queryObj, ...accessControl };
                }
            }

            let query = this.Model.find(queryObj);

            const total = await this.Model.countDocuments(queryObj);

            const docs = await query
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .populate('createdBy', 'username email')
                .populate('assignedTo', 'username email')
                .lean();

            const cacheKey = `${this.cachePrefix}:list:${JSON.stringify(req.query)}`;
            if (this.cachePrefix) {
                await setCache(cacheKey, { docs, total }, 300);
            }

            res.status(200).json({
                success: true,
                data: docs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error) {
            next(error);
        }
    };

    getOne = async (req, res, next) => {
        try {
            const { id } = req.params;

            const cacheKey = `${this.cachePrefix}:${id}`;
            if (this.cachePrefix) {
                const cached = await getCache(cacheKey);
                if (cached) {
                    return res.status(200).json({
                        success: true,
                        data: cached,
                    });
                }
            }

            let queryObj = { _id: id };

            if (req.user.role === 'user') {
                queryObj.$or = [
                    { createdBy: req.user._id },
                    { assignedTo: req.user._id },
                ];
            }

            let query = this.Model.findOne(queryObj);

            const doc = await query
                .populate('createdBy', 'username email')
                .populate('assignedTo', 'username email');

            if (!doc) {
                return res.status(404).json({
                    success: false,
                    message: `${this.Model.modelName} not found`,
                });
            }

            if (this.cachePrefix) {
                await setCache(cacheKey, doc, 300);
            }

            res.status(200).json({
                success: true,
                data: doc,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const doc = await this.Model.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            )
                .populate('createdBy', 'username email')
                .populate('assignedTo', 'username email');

            if (!doc) {
                return res.status(404).json({
                    success: false,
                    message: `${this.Model.modelName} not found`,
                });
            }

            if (this.cachePrefix) {
                await deleteCache(`${this.cachePrefix}:${id}`);
                await deleteCachePattern(`${this.cachePrefix}:list:*`);
            }

            const io = req.app.get('io');
            if (io) {
                io.emit(`${this.cachePrefix}:updated`, doc);
                if (doc.assignedTo) {
                    io.to(`user-${doc.assignedTo}`).emit(`${this.cachePrefix}:updated`, doc);
                }
                if (doc.createdBy) {
                    io.to(`user-${doc.createdBy._id || doc.createdBy}`).emit(`${this.cachePrefix}:updated`, doc);
                }
            }

            res.status(200).json({
                success: true,
                message: `${this.Model.modelName} updated successfully`,
                data: doc,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req, res, next) => {
        try {
            const { id } = req.params;

            const doc = await this.Model.findByIdAndDelete(id);

            if (!doc) {
                return res.status(404).json({
                    success: false,
                    message: `${this.Model.modelName} not found`,
                });
            }

            if (this.cachePrefix) {
                await deleteCache(`${this.cachePrefix}:${id}`);
                await deleteCachePattern(`${this.cachePrefix}:list:*`);
            }

            const io = req.app.get('io');
            if (io) {
                io.emit(`${this.cachePrefix}:deleted`, { id });
                if (doc.assignedTo) {
                    io.to(`user-${doc.assignedTo}`).emit(`${this.cachePrefix}:deleted`, { id });
                }
                if (doc.createdBy) {
                    io.to(`user-${doc.createdBy._id || doc.createdBy}`).emit(`${this.cachePrefix}:deleted`, { id });
                }
            }

            res.status(200).json({
                success: true,
                message: `${this.Model.modelName} deleted successfully`,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = GenericCRUD;
