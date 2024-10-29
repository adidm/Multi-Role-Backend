import Users from "../models/UserModel.js";

export const verifyUser = async (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ msg: "Harap Login terlebih dahulu" });
    const user = await Users.findOne({
        where: {
            uuid: req.session.userId // set from Login controller before
        }
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    req.userId = user.id;
    req.role = user.role;
    next();
}

export const adminOnly = async (req, res, next) => {
    const user = await Users.findOne({
        where: {
            uuid: req.session.userId
        }
    });
    if (user.role !== "admin") return res.status(403).json({ msg: "Akses ditolak" });
    next();
}