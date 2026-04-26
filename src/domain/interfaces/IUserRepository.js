/**
 * @interface IUserRepository
 */

/**
 * @function
 * @name IUserRepository#findUserByEmail
 * @param {string} email
 * @returns {Promise<Object|null>} User data object
 */

/**
 * @function
 * @name IUserRepository#createUser
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.name
 * @param {string} userData.passwordHash
 * @returns {Promise<Object>} Created user data object
 */

/**
 * @function
 * @name IUserRepository#updateUserByEmail
 * @param {string} email
 * @param {Object} updates
 * @returns {Promise<Object|null>} Updated user data object
 */

export default {};
