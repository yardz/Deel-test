export const getUserId = (req) => {
    const profile = req.profile;
    return profile.id;
};
