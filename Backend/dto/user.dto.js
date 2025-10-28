function mapUserToUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    placeOfBirth: user.placeOfBirth,
    dateOfBirth: user.dateOfBirth,
    position: user.position,
    skills: user.skills,
    managerId: user.managerId,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    active: user.active,
  };
}

const userDto = { mapUserToUserResponse };

module.exports = userDto;
