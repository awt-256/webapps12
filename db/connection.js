const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000")
}

const db = mysql.createPool(dbConfig);

const WIPE_ITEMS_SQL = `
DELETE FROM Items;`;
const WIPE_CATEGORIES_SQL = `
DELETE FROM Categories;`;
const wipeAll = (callback) => {
    db.execute(WIPE_ITEMS_SQL, () => {
        return db.execute(WIPE_CATEGORIES_SQL, callback);
    });
}

const INSERT_CATEGORY_WITH_NAME = `
INSERT INTO Categories
    (name, ownerUserId)
VALUES
    (?, ?);`

const GET_CATEGORY_BY_NAME = `
SELECT
    id
FROM
    Categories c
WHERE
    c.name = ?
AND c.ownerUserId = ?;`;
const getCategoriesIdOf = (name, userId, callback) => {
    return db.execute(GET_CATEGORY_BY_NAME, [ name, userId ], (error, results) => {
        if (error) return callback(error, []);
        // promises f
        if (!results.length) {
            return db.execute(INSERT_CATEGORY_WITH_NAME, [ name, userId ], (error, results) => {
                if (error) return callback(error, [null]);

                // lol
                return getCategoriesIdOf(name, userId, callback);
            });
        }

        const {id} = results[0];
        return callback(error, id);
    });
}

const INSERT_INTO_INVENTORY_SQL = `
INSERT INTO Items
    (name, quantity, description, lastModified, ownerUserId, categoryId)
VALUES
    (?, ?, ?, ?, ?, ?);`;
const insertIntoInventory = (userId, name, quantity, description, lastModified, categoryName, callback) => {
    return getCategoriesIdOf(categoryName, userId, (error, categoryId) => {
        if (error) return callback(error, []);
        return db.execute(INSERT_INTO_INVENTORY_SQL, [
            name, quantity, description, lastModified, userId, categoryId
        ], callback);
    });
}


const READ_INVENTORY_SQL = `SELECT * FROM Items WHERE ownerUserId = ?;`;
const readAllInventory = (userId, callback) => {
    return db.execute(READ_INVENTORY_SQL, [userId], callback);
}

const READ_CATEGORIES_SQL = `SELECT id, name FROM Categories WHERE ownerUserId = ?;`;
const readAllCategories = (userId, callback) => {
    return db.execute(READ_CATEGORIES_SQL, [userId], callback);
}



const READ_ITEM_INVENTORY_SQL = `
SELECT 
    Items.id, Items.name, quantity, description, lastModified, categoryId
FROM
    Items
JOIN Categories c
    ON c.id = categoryId
WHERE
    Items.id = ? AND
    Items.ownerUserId = ?;`;
const readItemInventory = (userId, id, callback) => {
    return db.execute(READ_ITEM_INVENTORY_SQL, [id, userId], callback);
}


const DELETE_ITEM_INVENTORY_SQL = `
DELETE FROM Items
WHERE id = ? AND ownerUserId = ?`;
const deleteItemInventory = (userId, id, callback) => {
    return db.execute(DELETE_ITEM_INVENTORY_SQL, [id, userId], callback);
}


const UPDATE_ITEM_INVENTORY_SQL = `
UPDATE Items
SET name = ?,
    quantity = ?,
    description = ?,
    lastModified = ?,
    categoryId = ?
WHERE
    ownerUserId = ? AND
    id = ?;`;
const updateItemInventory = (userId, id, name, quantity, description, categoryName, lastModified, callback) => {
    return getCategoriesIdOf(categoryName, userId, (error, categoryId) => {
        if (error) return callback(error, []);
        return db.execute(UPDATE_ITEM_INVENTORY_SQL, [name, quantity, description, lastModified, categoryId, userId, id], callback);
    });
}


module.exports = {};
module.exports.wipe = wipeAll;
module.exports.delete = deleteItemInventory;
module.exports.insert = insertIntoInventory;
module.exports.readAll = readAllInventory;
module.exports.readCategories = readAllCategories;
module.exports.read = readItemInventory;
module.exports.update = updateItemInventory;
module.exports.disconnect = () => db.end();