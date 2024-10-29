import Users from "../models/UserModel.js";
import argon2 from "argon2";

export const getUsers = async (req, res) => {
    try {
        const response = await Users.findAll({
            attributes: ['uuid', 'name', 'email', 'role']
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        const response = await Users.findOne({
            where: {
                uuid: req.params.id
            },
            attributes: ['uuid', 'name', 'email', 'role']
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const createUser = async (req, res) => {
    // validate password request
    const { name, email, password, confPassword, role } = req.body;
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
    const hashPassword = await argon2.hash(password);
    const isUserExist = await Users.findOne({ where: { email: email } });
    if (isUserExist) return res.status(409).json({ msg: "User sudah ada!" });
    try {
        await Users.create({ name, email, password: hashPassword, role });
        res.status(200).json({ msg: "User berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
export const updateUser = async (req, res) => {
    const user = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    const { name, email, password, confPassword, role } = req.body;
    let hashPassword;
    if (password === "" || password === null) {
        hashPassword: user.password
    } else {
        hashPassword: await argon2.hash(password);
    }
    if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
    try {
        await Users.update({
            name,
            email,
            password: hashPassword,
            role
        }, {
            where: {
                uuid: user.id
            }
        });
        res.status(200).json({ msg: "User Updated!" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
}
export const deleteUser = async (req, res) => {
    const user = await Users.findOne({
        where: {
            uuid: req.params.id
        }
    });
    try {
        await Users.destroy({
            where: {
                id: user.id
            }
        });
        res.status(200).json({ msg: "User berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
