function mapUserToUserResponse(user) {
  return {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    placeOfBirth: user.placeOfBirth,
    dateOfBirth: user.dateOfBirth,
    position: user.position,
    skills: user.skills,
    managerId: user.managerId,
    role: user.role,
  };
}

const userDto = { mapUserToUserResponse };

module.exports = userDto;
